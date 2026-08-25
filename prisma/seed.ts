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
	{
		name: "Kopi Susu Gula Aren",
		description: "Espresso, fresh milk, palm sugar syrup",
		price: 22000,
		stock: 48,
		category: "Coffee",
	},
	{
		name: "Americano",
		description: "Double shot espresso with hot water",
		price: 18000,
		stock: 52,
		category: "Coffee",
	},
	{
		name: "Cappuccino",
		description: "Espresso topped with steamed milk foam",
		price: 25000,
		stock: 35,
		category: "Coffee",
	},
	{
		name: "Matcha Latte",
		description: "Ceremonial grade matcha with steamed milk",
		price: 28000,
		stock: 8,
		category: "Coffee",
	},
	{
		name: "Nasi Goreng D'Bherunk",
		description: "House fried rice with egg and crackers",
		price: 32000,
		stock: 24,
		category: "Meals",
	},
	{
		name: "Ayam Geprek",
		description: "Smashed crispy chicken with sambal",
		price: 27000,
		stock: 19,
		category: "Meals",
	},
	{
		name: "Mie Goreng Spesial",
		description: "Stir-fried noodles with vegetables and egg",
		price: 26000,
		stock: 21,
		category: "Meals",
	},
	{
		name: "Kentang Goreng",
		description: "Crispy french fries with house dip",
		price: 20000,
		stock: 40,
		category: "Snacks",
	},
	{
		name: "Pisang Goreng Keju",
		description: "Fried banana bites with grated cheese",
		price: 15000,
		stock: 6,
		category: "Snacks",
	},
	{
		name: "Roti Bakar Cokelat",
		description: "Toasted bread with chocolate sprinkles",
		price: 16000,
		stock: 30,
		category: "Snacks",
	},
	{
		name: "Croissant Butter",
		description: "Flaky butter croissant, baked daily",
		price: 18000,
		stock: 14,
		category: "Dessert",
	},
	{
		name: "Tiramisu Cup",
		description: "Classic tiramisu served in a cup",
		price: 29000,
		stock: 9,
		category: "Dessert",
	},
	{
		name: "Caffè Latte",
		description: "Smooth espresso with steamed milk",
		price: 24000,
		stock: 32,
		category: "Coffee",
	},

	{
		name: "Caramel Macchiato",
		description: "Espresso with steamed milk, caramel, and vanilla",
		price: 28000,
		stock: 27,
		category: "Coffee",
	},

	{
		name: "Mocha",
		description: "Espresso blended with chocolate and steamed milk",
		price: 27000,
		stock: 25,
		category: "Coffee",
	},

	{
		name: "Vanilla Latte",
		description: "Espresso, steamed milk, and vanilla syrup",
		price: 26000,
		stock: 22,
		category: "Coffee",
	},

	{
		name: "Hazelnut Latte",
		description: "Espresso with creamy milk and hazelnut syrup",
		price: 27000,
		stock: 18,
		category: "Coffee",
	},

	{
		name: "Kopi Hitam Gula Kelapa",
		description: "Strong black coffee with Indonesian coconut sugar",
		price: 20000,
		stock: 45,
		category: "Coffee",
	},

	{
		name: "Kopi Susu Pandan",
		description: "Espresso, fresh milk, and fragrant pandan syrup",
		price: 24000,
		stock: 20,
		category: "Coffee",
	},

	{
		name: "Iced Americano",
		description: "Double shot espresso served over ice and water",
		price: 20000,
		stock: 38,
		category: "Coffee",
	},

	{
		name: "Iced Caramel Latte",
		description: "Espresso, fresh milk, caramel syrup, and ice",
		price: 28000,
		stock: 24,
		category: "Coffee",
	},

	{
		name: "Chocolate Latte",
		description: "Rich chocolate blended with espresso and milk",
		price: 27000,
		stock: 16,
		category: "Coffee",
	},

	{
		name: "Nasi Ayam Sambal Matah",
		description:
			"Steamed rice with crispy chicken and Balinese sambal matah",
		price: 30000,
		stock: 22,
		category: "Meals",
	},

	{
		name: "Nasi Ayam Teriyaki",
		description:
			"Steamed rice with grilled chicken and sweet teriyaki sauce",
		price: 31000,
		stock: 20,
		category: "Meals",
	},

	{
		name: "Nasi Ayam Sambal Ijo",
		description: "Steamed rice with crispy chicken and spicy green sambal",
		price: 29000,
		stock: 18,
		category: "Meals",
	},

	{
		name: "Chicken Katsu Rice",
		description: "Crispy chicken katsu served with steamed rice and sauce",
		price: 32000,
		stock: 17,
		category: "Meals",
	},

	{
		name: "Beef Black Pepper Rice",
		description: "Sliced beef with black pepper sauce and steamed rice",
		price: 38000,
		stock: 12,
		category: "Meals",
	},

	{
		name: "Nasi Goreng Seafood",
		description: "Fried rice with shrimp, squid, egg, and vegetables",
		price: 35000,
		stock: 15,
		category: "Meals",
	},

	{
		name: "Mie Goreng Ayam",
		description: "Stir-fried noodles with chicken, vegetables, and egg",
		price: 28000,
		stock: 23,
		category: "Meals",
	},

	{
		name: "Kwetiau Goreng",
		description: "Stir-fried flat rice noodles with egg and vegetables",
		price: 28000,
		stock: 19,
		category: "Meals",
	},

	{
		name: "Chicken Burger",
		description: "Crispy chicken, lettuce, tomato, and house sauce",
		price: 32000,
		stock: 14,
		category: "Meals",
	},

	{
		name: "Beef Burger",
		description: "Juicy beef patty with cheese, lettuce, and house sauce",
		price: 38000,
		stock: 11,
		category: "Meals",
	},

	{
		name: "Chicken Wings",
		description: "Crispy chicken wings with spicy house sauce",
		price: 30000,
		stock: 20,
		category: "Snacks",
	},

	{
		name: "Tahu Crispy",
		description: "Crispy fried tofu served with spicy dipping sauce",
		price: 16000,
		stock: 35,
		category: "Snacks",
	},

	{
		name: "Tempe Mendoan",
		description: "Traditional soft fried tempeh served with chili sauce",
		price: 17000,
		stock: 28,
		category: "Snacks",
	},

	{
		name: "Onion Rings",
		description: "Crispy battered onion rings with house dip",
		price: 19000,
		stock: 25,
		category: "Snacks",
	},

	{
		name: "Mozzarella Sticks",
		description: "Golden fried mozzarella sticks with tomato dip",
		price: 25000,
		stock: 13,
		category: "Snacks",
	},

	{
		name: "Cireng Sambal Rujak",
		description: "Crispy tapioca fritters served with sweet spicy sauce",
		price: 18000,
		stock: 30,
		category: "Snacks",
	},

	{
		name: "Pisang Goreng Cokelat",
		description: "Crispy fried banana with chocolate drizzle",
		price: 17000,
		stock: 24,
		category: "Snacks",
	},

	{
		name: "French Toast",
		description: "Golden toasted bread with honey and powdered sugar",
		price: 22000,
		stock: 16,
		category: "Dessert",
	},

	{
		name: "Chocolate Brownie",
		description: "Rich fudgy chocolate brownie served with chocolate sauce",
		price: 23000,
		stock: 12,
		category: "Dessert",
	},

	{
		name: "Cheesecake Slice",
		description: "Creamy classic cheesecake with berry sauce",
		price: 28000,
		stock: 8,
		category: "Dessert",
	},

	{
		name: "Choco Lava Cake",
		description: "Warm chocolate cake with a molten chocolate center",
		price: 30000,
		stock: 7,
		category: "Dessert",
	},

	{
		name: "Panna Cotta",
		description: "Silky vanilla panna cotta with strawberry sauce",
		price: 26000,
		stock: 10,
		category: "Dessert",
	},

	{
		name: "Banana Split",
		description:
			"Banana with vanilla ice cream, chocolate sauce, and sprinkles",
		price: 28000,
		stock: 9,
		category: "Dessert",
	},

	{
		name: "Waffle Ice Cream",
		description:
			"Crispy waffle served with vanilla ice cream and chocolate sauce",
		price: 27000,
		stock: 14,
		category: "Dessert",
	},
	{
		name: "Espresso",
		description: "Rich and bold single shot of freshly brewed espresso",
		price: 15000,
		stock: 40,
		category: "Coffee",
	},

	{
		name: "Double Espresso",
		description: "Double shot of rich and aromatic espresso",
		price: 19000,
		stock: 35,
		category: "Coffee",
	},

	{
		name: "Flat White",
		description: "Double espresso with velvety steamed milk",
		price: 26000,
		stock: 21,
		category: "Coffee",
	},

	{
		name: "Affogato",
		description: "Vanilla ice cream topped with a fresh espresso shot",
		price: 26000,
		stock: 11,
		category: "Coffee",
	},

	{
		name: "Coconut Coffee",
		description: "Espresso blended with creamy coconut milk and ice",
		price: 27000,
		stock: 18,
		category: "Coffee",
	},

	{
		name: "Butterscotch Latte",
		description: "Espresso and steamed milk with sweet butterscotch syrup",
		price: 28000,
		stock: 15,
		category: "Coffee",
	},

	{
		name: "Salted Caramel Coffee",
		description: "Iced espresso with milk, caramel, and sea salt",
		price: 29000,
		stock: 17,
		category: "Coffee",
	},

	{
		name: "Brown Sugar Latte",
		description: "Espresso with fresh milk and rich brown sugar syrup",
		price: 26000,
		stock: 26,
		category: "Coffee",
	},

	{
		name: "Cinnamon Latte",
		description: "Espresso with steamed milk and aromatic cinnamon syrup",
		price: 25000,
		stock: 19,
		category: "Coffee",
	},

	{
		name: "Cold Brew",
		description: "Smooth slow-steeped coffee served chilled over ice",
		price: 24000,
		stock: 30,
		category: "Coffee",
	},

	{
		name: "Nasi Ayam Bakar",
		description: "Grilled marinated chicken with steamed rice and sambal",
		price: 32000,
		stock: 18,
		category: "Meals",
	},

	{
		name: "Nasi Ayam Crispy",
		description: "Crispy chicken served with steamed rice and house sambal",
		price: 29000,
		stock: 25,
		category: "Meals",
	},

	{
		name: "Nasi Beef Teriyaki",
		description: "Tender beef slices with teriyaki sauce and steamed rice",
		price: 37000,
		stock: 13,
		category: "Meals",
	},

	{
		name: "Nasi Goreng Kampung",
		description:
			"Traditional Indonesian fried rice with egg and spicy sambal",
		price: 28000,
		stock: 27,
		category: "Meals",
	},

	{
		name: "Nasi Goreng Ayam",
		description:
			"Fried rice with chicken, egg, vegetables, and sweet soy sauce",
		price: 30000,
		stock: 22,
		category: "Meals",
	},

	{
		name: "Nasi Goreng Pete",
		description:
			"Indonesian fried rice with petai, egg, and spicy seasoning",
		price: 30000,
		stock: 14,
		category: "Meals",
	},

	{
		name: "Chicken Yakiniku Rice",
		description:
			"Grilled chicken with Japanese yakiniku sauce and steamed rice",
		price: 33000,
		stock: 16,
		category: "Meals",
	},

	{
		name: "Chicken Rice Bowl",
		description:
			"Chicken pieces with vegetables, egg, and savory house sauce",
		price: 29000,
		stock: 20,
		category: "Meals",
	},

	{
		name: "Beef Rice Bowl",
		description: "Tender beef slices with onions and savory house sauce",
		price: 35000,
		stock: 12,
		category: "Meals",
	},

	{
		name: "Spaghetti Bolognese",
		description: "Spaghetti with rich beef tomato sauce and parmesan",
		price: 32000,
		stock: 15,
		category: "Meals",
	},

	{
		name: "Spaghetti Carbonara",
		description: "Creamy spaghetti with smoked beef and parmesan cheese",
		price: 34000,
		stock: 13,
		category: "Meals",
	},

	{
		name: "Chicken Steak",
		description: "Grilled chicken steak with black pepper sauce and fries",
		price: 35000,
		stock: 10,
		category: "Meals",
	},

	{
		name: "Beef Steak",
		description: "Grilled beef steak with black pepper sauce and fries",
		price: 45000,
		stock: 8,
		category: "Meals",
	},

	{
		name: "Fish and Chips",
		description:
			"Crispy fried fish served with french fries and tartar sauce",
		price: 36000,
		stock: 11,
		category: "Meals",
	},

	{
		name: "Chicken Quesadilla",
		description:
			"Grilled tortilla filled with chicken, cheese, and vegetables",
		price: 30000,
		stock: 14,
		category: "Meals",
	},

	{
		name: "Loaded Fries",
		description:
			"French fries topped with chicken, cheese, and house sauce",
		price: 27000,
		stock: 19,
		category: "Snacks",
	},

	{
		name: "Cheese Fries",
		description: "Crispy french fries topped with creamy melted cheese",
		price: 24000,
		stock: 23,
		category: "Snacks",
	},

	{
		name: "Chicken Popcorn",
		description: "Bite-sized crispy chicken served with spicy mayo",
		price: 26000,
		stock: 21,
		category: "Snacks",
	},

	{
		name: "Sosis Bakar",
		description: "Grilled sausages served with barbecue and chili sauce",
		price: 22000,
		stock: 26,
		category: "Snacks",
	},

	{
		name: "Sosis Kentang",
		description: "Crispy potato-wrapped sausages with house dipping sauce",
		price: 23000,
		stock: 18,
		category: "Snacks",
	},

	{
		name: "Nachos Cheese",
		description: "Crispy tortilla chips with melted cheese and salsa",
		price: 25000,
		stock: 16,
		category: "Snacks",
	},

	{
		name: "Nachos Chicken",
		description: "Tortilla chips topped with chicken, cheese, and salsa",
		price: 30000,
		stock: 12,
		category: "Snacks",
	},

	{
		name: "Garlic Bread",
		description: "Toasted bread with garlic butter and herbs",
		price: 18000,
		stock: 29,
		category: "Snacks",
	},

	{
		name: "Jamur Crispy",
		description: "Crispy fried mushrooms with spicy mayonnaise dip",
		price: 19000,
		stock: 24,
		category: "Snacks",
	},

	{
		name: "Dimsum Ayam",
		description: "Steamed chicken dumplings served with chili sauce",
		price: 24000,
		stock: 17,
		category: "Snacks",
	},

	{
		name: "Pancake Stack",
		description: "Fluffy pancakes with honey, butter, and fresh fruit",
		price: 25000,
		stock: 15,
		category: "Dessert",
	},

	{
		name: "Churros",
		description: "Crispy cinnamon churros served with chocolate dip",
		price: 22000,
		stock: 18,
		category: "Dessert",
	},

	{
		name: "Chocolate Mousse",
		description: "Smooth and creamy chocolate mousse with cocoa topping",
		price: 25000,
		stock: 9,
		category: "Dessert",
	},

	{
		name: "Red Velvet Cake",
		description: "Soft red velvet cake with creamy cheese frosting",
		price: 28000,
		stock: 7,
		category: "Dessert",
	},

	{
		name: "Apple Pie",
		description: "Warm baked apple pie with cinnamon and buttery crust",
		price: 26000,
		stock: 8,
		category: "Dessert",
	},

	{
		name: "Matcha Cheesecake",
		description: "Creamy cheesecake infused with premium matcha",
		price: 30000,
		stock: 6,
		category: "Dessert",
	},
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
			categoryIds.set(
				product.category,
				await ensureCategory(product.category),
			);
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
	console.log(
		`Seed complete → users: ${users}, categories: ${categories}, products: ${products}`,
	);
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
