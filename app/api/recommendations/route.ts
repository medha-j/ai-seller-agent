import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ error: "No store" }, { status: 404 });
    }

    const storeId = user.stores[0].id;

    const recommendations = await prisma.recommendation.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json({ error: "No store" }, { status: 404 });
    }

    const storeId = user.stores[0].id;
    const { recommendationId, status, actualRevenueLift } = await req.json();

    const recommendation = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        status,
        executedAt: status === "executed" ? new Date() : null,
        actualRevenueLift: actualRevenueLift || null,
      },
    });

    // Log to audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        storeId,
        recommendationId,
        action: `recommendation_${status}`,
        details: JSON.stringify({
          status,
          actualRevenueLift,
          timestamp: new Date(),
        }),
      },
    });

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Recommendation update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}