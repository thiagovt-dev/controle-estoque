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
import { ServerActionError, withErrorHandling } from "@/actions/errorAction";

export async function openInventory(formData: FormData) {
  return withErrorHandling(async () => {
    const supabase = await getServerSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) throw new ServerActionError("Unauthorized", 401);
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
    return null as unknown as void;
  });
}

export async function upsertInventoryItem(formData: FormData) {
  return withErrorHandling(async () => {
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
    await uc.execute(parsed);
    revalidateTag(TAGS.inventory(parsed.inventoryId));
    return null as unknown as void;
  });
}

export async function closeInventory(formData: FormData) {
  return withErrorHandling(async () => {
    const supabase = await getServerSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) throw new ServerActionError("Unauthorized", 401);
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
    return null as unknown as void;
  });
}
