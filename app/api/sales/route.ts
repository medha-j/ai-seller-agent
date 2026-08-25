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

    const sales = await prisma.salesLog.findMany({
      where: { storeId },
      include: { product: true },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(sales);
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
    const { productId, quantity, pricePerUnit, customerSegment } =
      await req.json();

    if (!productId || !quantity || !pricePerUnit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const totalAmount = quantity * pricePerUnit;

    const sale = await prisma.salesLog.create({
      data: {
        storeId,
        productId,
        quantity: parseInt(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        totalAmount,
        customerSegment,
      },
      include: { product: true },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Sales POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}