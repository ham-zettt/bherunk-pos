import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import type { Role } from "../app/generated/prisma/enums";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Documented development password for all seeded accounts.
const SEED_PASSWORD = "dbherunk123";

async function seedUser(name: string, email: string, role: Role) {
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, password: hashSync(SEED_PASSWORD, 10), role },
  });
}

async function ensureCategory(name: string): Promise<string> {
  const existing = await prisma.category.findFirst({ where: { name } });
  if (existing) return existing.id;
  const created = await prisma.category.create({ data: { name } });
  return created.id;
}

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

const PRODUCTS: SeedProduct[] = [
  { name: "Kopi Susu Gula Aren", description: "Espresso, fresh milk, palm sugar syrup", price: 22000, stock: 48, category: "Coffee" },
  { name: "Americano", description: "Double shot espresso with hot water", price: 18000, stock: 52, category: "Coffee" },
  { name: "Cappuccino", description: "Espresso topped with steamed milk foam", price: 25000, stock: 35, category: "Coffee" },
  { name: "Matcha Latte", description: "Ceremonial grade matcha with steamed milk", price: 28000, stock: 8, category: "Coffee" },
  { name: "Nasi Goreng D'Bherunk", description: "House fried rice with egg and crackers", price: 32000, stock: 24, category: "Meals" },
  { name: "Ayam Geprek", description: "Smashed crispy chicken with sambal", price: 27000, stock: 19, category: "Meals" },
  { name: "Mie Goreng Spesial", description: "Stir-fried noodles with vegetables and egg", price: 26000, stock: 21, category: "Meals" },
  { name: "Kentang Goreng", description: "Crispy french fries with house dip", price: 20000, stock: 40, category: "Snacks" },
  { name: "Pisang Goreng Keju", description: "Fried banana bites with grated cheese", price: 15000, stock: 6, category: "Snacks" },
  { name: "Roti Bakar Cokelat", description: "Toasted bread with chocolate sprinkles", price: 16000, stock: 30, category: "Snacks" },
  { name: "Croissant Butter", description: "Flaky butter croissant, baked daily", price: 18000, stock: 14, category: "Dessert" },
  { name: "Tiramisu Cup", description: "Classic tiramisu served in a cup", price: 29000, stock: 9, category: "Dessert" },
];

async function main() {
  console.log("Seeding users…");
  await seedUser("Bherunk Admin", "admin@dbherunk.id", "ADMIN");
  await seedUser("Cashier Satu", "cashier@dbherunk.id", "CASHIER");
  await seedUser("Kitchen Barista", "kitchen@dbherunk.id", "KITCHEN");

  console.log("Seeding categories & products…");
  const categoryIds = new Map<string, string>();
  for (const product of PRODUCTS) {
    if (!categoryIds.has(product.category)) {
      categoryIds.set(product.category, await ensureCategory(product.category));
    }
    const categoryId = categoryIds.get(product.category)!;
    const existing = await prisma.product.findFirst({
      where: { name: product.name, categoryId },
    });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId,
        },
      });
    }
  }

  const [users, categories, products] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.product.count(),
  ]);
  console.log(`Seed complete → users: ${users}, categories: ${categories}, products: ${products}`);
  console.log(`Dev login password for all seeded accounts: ${SEED_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
