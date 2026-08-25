import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { stores: true },
    });

    if (!user?.stores?.length) {
      return NextResponse.json({ error: "No store found" }, { status: 404 });
    }

    const storeId = user.stores[0].id;

    // Fetch store data
    const [products, salesLogs] = await Promise.all([
      prisma.product.findMany({ where: { storeId } }),
      prisma.salesLog.findMany({
        where: { storeId },
        include: { product: true },
        orderBy: { timestamp: "desc" },
        take: 50,
      }),
    ]);

    if (!products.length) {
      return NextResponse.json(
        { error: "Add products first" },
        { status: 400 }
      );
    }

    // Prepare data for Claude
    const totalRevenue = salesLogs.reduce((sum: number, log: any) => sum + log.totalAmount, 0);
    
    const topProducts = products
      .map((p: any) => ({
        name: p.name,
        price: p.price,
        stock: p.stock,
        sales: salesLogs.filter((s: any) => s.productId === p.id).length,
      }))
      .sort((a: any, b: any) => b.sales - a.sales);

    const slowMovers = products
      .filter(
        (p: any) => !salesLogs.find((s: any) => s.productId === p.id) || p.stock > 20
      )
      .map((p: any) => ({ name: p.name, price: p.price, stock: p.stock }));

    const prompt = `You are an AI seller growth expert. Analyze this merchant's store data and provide 3-5 actionable recommendations to boost revenue.

Store Data:
- Total Revenue: ₹${totalRevenue}
- Total Products: ${products.length}
- Total Sales: ${salesLogs.length}
- Top Products: ${JSON.stringify(topProducts.slice(0, 3))}
- Slow Movers: ${JSON.stringify(slowMovers.slice(0, 3))}
- Products: ${JSON.stringify(products.map((p: any) => ({ name: p.name, price: p.price, stock: p.stock })))}

Provide recommendations in this JSON format ONLY:
{
  "recommendations": [
    {
      "type": "bundle|pricing|upsell|campaign",
      "title": "Short title",
      "description": "Detailed recommendation",
      "reasoning": "Why this will work",
      "expectedImpact": "X% revenue increase estimate"
    }
  ]
}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Invalid response from AI" },
        { status: 500 }
      );
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 500 }
      );
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    // Save recommendations to database
    const savedRecommendations = await Promise.all(
      aiResponse.recommendations.map((rec: any) =>
        prisma.recommendation.create({
          data: {
            storeId,
            recommendationType: rec.type,
            title: rec.title,
            description: rec.description,
            reasoning: JSON.stringify({
              reasoning: rec.reasoning,
              expectedImpact: rec.expectedImpact,
            }),
            status: "pending",
          },
        })
      )
    );

    // Log to audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        storeId,
        action: "agent_recommendations_generated",
        details: JSON.stringify({
          recommendationCount: savedRecommendations.length,
          timestamp: new Date(),
        }),
      },
    });

    return NextResponse.json({
      recommendations: savedRecommendations,
      aiAnalysis: aiResponse,
    });
  } catch (error: any) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}