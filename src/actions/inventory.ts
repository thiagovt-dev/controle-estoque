"use server";

import { revalidateTag } from "next/cache";
import { getServerSupabase } from "../infra/supabase/server";
import { inventoryOpenSchema, inventoryItemSchema, inventoryCloseSchema } from "../lib/zodSchemas";
import { SupabaseInventoryRepository } from "../data/implementations/SupabaseInventoryRepository";
import { OpenInventory } from "../domain/use-cases/OpenInventory";

import { TAGS } from "../lib/cacheTags";
import { requireRole } from "../infra/auth/requireRole";
import { UpsertInventoryItem } from "@/domain/use-cases/UpsertInventory";
import { CloseInventory } from "@/domain/use-cases/CloseInvetory";

export async function openInventory(formData: FormData) {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Unauthorized");
  const payload = {
    orgId: String(formData.get("orgId") || ""),
    warehouseId: String(formData.get("warehouseId") || ""),
  };
  const parsed = inventoryOpenSchema.parse(payload);
  await requireRole(["admin", "operator"], parsed.orgId);
  const repo = new SupabaseInventoryRepository();
  const useCase = new OpenInventory(repo);
  const created = await useCase.execute({ ...parsed, userId: auth.user.id });
  revalidateTag(TAGS.inventoryList);
  revalidateTag(TAGS.inventory(created.id));
  return created;
}

export async function upsertInventoryItem(formData: FormData) {
  const payload = {
    inventoryId: String(formData.get("inventoryId") || ""),
    productId: String(formData.get("productId") || ""),
    countedQty: Number(formData.get("countedQty") || 0),
  };
  const parsed = inventoryItemSchema.parse(payload);
  const repo = new SupabaseInventoryRepository();
  const { inventory } = await repo.getWithItems(parsed.inventoryId);
  await requireRole(["admin", "operator"], inventory.orgId);
  const uc = new UpsertInventoryItem(repo);
  const row = await uc.execute(parsed);
  revalidateTag(TAGS.inventory(parsed.inventoryId));
  return row;
}

export async function closeInventory(formData: FormData) {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Unauthorized");
  const payload = {
    inventoryId: String(formData.get("inventoryId") || ""),
  };

  const parsed = inventoryCloseSchema.parse(payload);
  const repo = new SupabaseInventoryRepository();
  const { inventory } = await repo.getWithItems(parsed.inventoryId);
  await requireRole(["admin"], inventory.orgId);
  const uc = new CloseInventory(repo);
  await uc.execute({ inventoryId: parsed.inventoryId, userId: auth.user.id });
  revalidateTag(TAGS.inventory(parsed.inventoryId));
  revalidateTag(TAGS.inventoryList);
  revalidateTag(TAGS.movesList);
  return { ok: true };
}
