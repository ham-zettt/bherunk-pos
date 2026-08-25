"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const ProductSchema = z.object({
  name: z.string().trim().min(1, { error: "Nama wajib diisi." }).max(100),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  price: z.coerce
    .number({ error: "Harga harus berupa angka." })
    .positive({ error: "Harga harus lebih dari nol." })
    .max(10_000_000, { error: "Harga tidak wajar." }),
  stock: z.coerce
    .number({ error: "Stok harus berupa angka." })
    .int({ error: "Stok harus berupa bilangan bulat." })
    .min(0, { error: "Stok tidak boleh negatif." })
    .max(1_000_000),
  categoryId: z.uuid({ error: "Silakan pilih kategori." }),
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
      message: "Perbaiki kolom yang ditandai.",
    };
  }

  const categoryExists = await db.category.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true },
  });
  if (!categoryExists) {
    return { errors: { categoryId: ["Kategori sudah tidak ada."] }, message: "Perbaiki kolom yang ditandai." };
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
    return { message: "Produk tidak ditemukan." };
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
      message: "Perbaiki kolom yang ditandai.",
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
    return { message: "Produk sudah tidak ada. Muat ulang lalu coba lagi." };
  }
  if (!categoryExists) {
    return { errors: { categoryId: ["Kategori sudah tidak ada."] }, message: "Perbaiki kolom yang ditandai." };
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
    return { message: "Produk tidak ditemukan." };
  }

  const existing = await db.product.findUnique({
    where: { id: parsedId.data },
    select: { _count: { select: { orderItems: true } } },
  });
  if (!existing) {
    return { message: "Produk sudah tidak ada. Muat ulang lalu coba lagi." };
  }
  if (existing._count.orderItems > 0) {
    return {
      message: `Tidak dapat dihapus — produk ini muncul di ${existing._count.orderItems} catatan pesanan. Set stoknya menjadi 0 sebagai gantinya.`,
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
    error: "Perubahan harus +1 atau -1.",
  }),
});

export async function adjustStock(formData: FormData): Promise<DeleteResult> {
  await requireRole("ADMIN");

  const parsed = StockAdjustSchema.safeParse({
    productId: formData.get("productId"),
    delta: formData.get("delta"),
  });
  if (!parsed.success) {
    return { message: "Penyesuaian stok tidak valid." };
  }

  const result = await db.product.updateMany({
    where: { id: parsed.data.productId, stock: { gte: parsed.data.delta === -1 ? 1 : 0 } },
    data: { stock: { increment: parsed.data.delta } },
  });
  if (result.count === 0) {
    return { message: "Stok tidak bisa kurang dari nol atau produk sudah tidak ada." };
  }

  revalidatePath("/inventory");
  revalidatePath("/pos");
  return { ok: true };
}
