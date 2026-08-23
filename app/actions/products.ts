"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const ProductSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }).max(100),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  price: z.coerce
    .number({ error: "Price must be a number." })
    .positive({ error: "Price must be greater than zero." })
    .max(10_000_000, { error: "Price looks unrealistic." }),
  stock: z.coerce
    .number({ error: "Stock must be a number." })
    .int({ error: "Stock must be a whole number." })
    .min(0, { error: "Stock cannot be negative." })
    .max(1_000_000),
  categoryId: z.uuid({ error: "Please pick a category." }),
});

export type ProductFormState = {
  errors?: Partial<Record<"name" | "description" | "price" | "stock" | "categoryId", string[]>>;
  message?: string;
  ok?: boolean;
};

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireRole("ADMIN");

  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as ProductFormState["errors"],
      message: "Please fix the highlighted fields.",
    };
  }

  const categoryExists = await db.category.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true },
  });
  if (!categoryExists) {
    return { errors: { categoryId: ["Category no longer exists."] }, message: "Please fix the highlighted fields." };
  }

  const { description, ...rest } = parsed.data;
  await db.product.create({
    data: {
      ...rest,
      description: description || null,
      price: rest.price,
    },
  });

  revalidatePath("/inventory");
  return { ok: true };
}

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireRole("ADMIN");

  const productId = z.uuid().safeParse(formData.get("productId"));
  if (!productId.success) {
    return { message: "Product not found." };
  }

  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as ProductFormState["errors"],
      message: "Please fix the highlighted fields.",
    };
  }

  const [existing, categoryExists] = await Promise.all([
    db.product.findUnique({ where: { id: productId.data }, select: { id: true } }),
    db.category.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true },
    }),
  ]);
  if (!existing) {
    return { message: "Product no longer exists. Refresh and try again." };
  }
  if (!categoryExists) {
    return { errors: { categoryId: ["Category no longer exists."] }, message: "Please fix the highlighted fields." };
  }

  const { description, ...rest } = parsed.data;
  await db.product.update({
    where: { id: productId.data },
    data: {
      ...rest,
      description: description || null,
      price: rest.price,
    },
  });

  // Keep future consumers (POS catalog, order pages) in sync.
  revalidatePath("/inventory");
  revalidatePath("/pos");
  revalidatePath("/dashboard");
  return { ok: true };
}

export type DeleteResult = { ok?: boolean; message?: string };

/**
 * Hard-deletes a product. FK constraints make this impossible while OrderItems
 * reference it; the client confirms first and surfaces history counts.
 */
export async function deleteProduct(
  _prev: DeleteResult,
  formData: FormData,
): Promise<DeleteResult> {
  await requireRole("ADMIN");

  const parsedId = z.uuid().safeParse(formData.get("productId"));
  if (!parsedId.success) {
    return { message: "Product not found." };
  }

  const existing = await db.product.findUnique({
    where: { id: parsedId.data },
    select: { _count: { select: { orderItems: true } } },
  });
  if (!existing) {
    return { message: "Product no longer exists. Refresh and try again." };
  }
  if (existing._count.orderItems > 0) {
    return {
      message: `Cannot delete — this product appears in ${existing._count.orderItems} order record(s). Set its stock to 0 instead.`,
    };
  }

  await db.product.delete({ where: { id: parsedId.data } });
  revalidatePath("/inventory");
  revalidatePath("/pos");
  return { ok: true };
}

const StockAdjustSchema = z.object({
  productId: z.uuid(),
  delta: z.coerce.number().int().refine((v) => v === 1 || v === -1, {
    error: "Delta must be +1 or -1.",
  }),
});

export async function adjustStock(formData: FormData): Promise<DeleteResult> {
  await requireRole("ADMIN");

  const parsed = StockAdjustSchema.safeParse({
    productId: formData.get("productId"),
    delta: formData.get("delta"),
  });
  if (!parsed.success) {
    return { message: "Invalid stock adjustment." };
  }

  const result = await db.product.updateMany({
    where: { id: parsed.data.productId, stock: { gte: parsed.data.delta === -1 ? 1 : 0 } },
    data: { stock: { increment: parsed.data.delta } },
  });
  if (result.count === 0) {
    return { message: "Stock cannot go below zero or product no longer exists." };
  }

  revalidatePath("/inventory");
  revalidatePath("/pos");
  return { ok: true };
}
