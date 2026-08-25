import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding demo data...");

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo Merchant",
      password: await bcrypt.hash("demo123", 10),
    },
  });

  console.log("✅ Demo user created:", demoUser.email);

  // Create demo store
  const demoStore = await prisma.store.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      storeName: "TechHub Electronics",
      category: "Electronics",
      description: "Premium electronics and gadgets store",
    },
  });

  console.log("✅ Demo store created:", demoStore.storeName);

  // Create demo products
  const products = [
    { name: "Laptop", sku: "LAP-001", category: "Electronics", price: 100000, stock: 10 },
    { name: "Smartphone", sku: "PHONE-001", category: "Electronics", price: 50000, stock: 15 },
    { name: "Headphones", sku: "HEAD-001", category: "Electronics", price: 5000, stock: 30 },
    { name: "Tablet", sku: "TAB-001", category: "Electronics", price: 30000, stock: 8 },
    { name: "Charger", sku: "CHG-001", category: "Accessories", price: 1500, stock: 50 },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { storeId_sku: { storeId: demoStore.id, sku: prod.sku } },
      update: {},
      create: {
        storeId: demoStore.id,
        ...prod,
      },
    });
  }

  console.log("✅ Demo products created");

  // Create demo sales
  const createdProducts = await prisma.product.findMany({
    where: { storeId: demoStore.id },
  });

  const sales = [
    { productId: createdProducts[0].id, quantity: 2, pricePerUnit: 100000, totalAmount: 200000, segment: "repeat" },
    { productId: createdProducts[1].id, quantity: 1, pricePerUnit: 50000, totalAmount: 50000, segment: "new" },
    { productId: createdProducts[2].id, quantity: 3, pricePerUnit: 5000, totalAmount: 15000, segment: "repeat" },
    { productId: createdProducts[0].id, quantity: 1, pricePerUnit: 100000, totalAmount: 100000, segment: "vip" },
  ];

  for (const sale of sales) {
    await prisma.salesLog.create({
      data: {
        storeId: demoStore.id,
        productId: sale.productId,
        quantity: sale.quantity,
        pricePerUnit: sale.pricePerUnit,
        totalAmount: sale.totalAmount,
        customerSegment: sale.segment,
      },
    });
  }

  console.log("✅ Demo sales created");
  console.log("\n🎉 Seeding complete!");
  console.log("📧 Demo login: demo@example.com");
  console.log("🔑 Password: demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });