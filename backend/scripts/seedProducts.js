// Usage: node scripts/seedProducts.js you@company.com
require("dotenv").config();
const prisma = require("../db");

(async () => {
  const email = (process.argv[2] || "").toLowerCase();
  if (!email) { console.error("Usage: node scripts/seedProducts.js <user-email>"); process.exit(1); }
  const user = await prisma.user.findUnique({ where: { email }, include: { memberships: true } });
  if (!user || !user.memberships.length) { console.error(`No tenant found for ${email}`); process.exit(1); }
  const tenantId = user.memberships[0].tenantId;

  const defs = [
    { name: "Widget A",  sku: "W-A", trackingType: "NONE",   quantity: 0, costPrice: 0 },
    { name: "Chemical B", sku: "C-B", trackingType: "LOT",    quantity: 0, costPrice: 0 },
    { name: "Laptop C",  sku: "L-C", trackingType: "SERIAL", quantity: 0, costPrice: 0 },
  ];
  for (const d of defs) {
    await prisma.product.upsert({
      where: { tenantId_sku: { tenantId, sku: d.sku } },
      update: {},
      create: { tenantId, ...d },
    });
  }
  console.log(`Seeded 3 products for tenant ${tenantId}`);
})().finally(() => prisma.$disconnect());