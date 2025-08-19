"use server";

import { revalidateTag } from "next/cache";
import { moveSchema } from "../lib/zodSchemas";
import { SupabaseMoveRepository } from "../data/implementations/SupabaseMoveRepository";
import { CreateMove } from "../domain/use-cases/CreateMove";
import { TAGS } from "../lib/cacheTags";
import { getServerSupabase } from "../infra/supabase/server";

export async function createMove(formData: FormData) {
  const payload = {
    orgId: String(formData.get("orgId") || ""),
    type: String(formData.get("type") || "") as "IN" | "OUT" | "TRANSFER",
    productId: String(formData.get("productId") || ""),
    warehouseFromId: String(formData.get("warehouseFromId") || "") || null,
    warehouseToId: String(formData.get("warehouseToId") || "") || null,
    qty: Number(formData.get("qty") || 0),
    reason: String(formData.get("reason") || "") || null,
    refId: String(formData.get("refId") || "") || null,
  };

  const parsed = moveSchema.parse(payload);
  const supabase = await getServerSupabase();
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) throw new Error("Unauthorized");

  const repo = new SupabaseMoveRepository();
  const useCase = new CreateMove(repo);
  const created = await useCase.execute(parsed, user.user.id);
  revalidateTag(TAGS.movesList);
  revalidateTag(TAGS.stockProduct(created.productId));
  
  if (created.warehouseFromId) revalidateTag(TAGS.stockWarehouse(created.warehouseFromId));
  if (created.warehouseToId) revalidateTag(TAGS.stockWarehouse(created.warehouseToId));
  return created;
}
