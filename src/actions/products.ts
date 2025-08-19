"use server";

import { revalidateTag } from "next/cache";
import { productSchema } from "../lib/zodSchemas";
import { SupabaseProductRepository } from "../data/implementations/SupabaseProductRepository";
import { CreateProduct } from "../domain/use-cases/CreateProduct";
import { TAGS } from "../lib/cacheTags";
import { requireRole } from "../infra/auth/requireRole";
import { withErrorHandling } from "@/actions/errorAction";

export async function createProduct(formData: FormData) {
  return withErrorHandling(async () => {
    const payload = {
      orgId: String(formData.get("orgId") || ""),
      sku: String(formData.get("sku") || ""),
      name: String(formData.get("name") || ""),
      unitId: String(formData.get("unitId") || ""),
      categoryId: String(formData.get("categoryId") || "") || null,
      minStock: Number(formData.get("minStock") || 0),
      active: String(formData.get("active") || "true") === "true",
    };
    const parsed = productSchema.parse(payload);
    await requireRole(["admin"], parsed.orgId);
    const repo = new SupabaseProductRepository();
    const useCase = new CreateProduct(repo);
    const created = await useCase.execute(parsed);
    revalidateTag(TAGS.products);
    revalidateTag(TAGS.product(created.id));
    return null as unknown as void;
  });
}
