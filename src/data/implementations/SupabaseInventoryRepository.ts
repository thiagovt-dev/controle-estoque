import { getServerSupabase } from "../../infra/supabase/server";
import { Inventory } from "../../domain/entities/Inventory";
import { InventoryRepository, OpenInventoryInput } from "../../domain/use-cases/OpenInventory";

export class SupabaseInventoryRepository implements InventoryRepository {
  async open(input: OpenInventoryInput): Promise<Inventory> {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("inventories")
      .insert({
        org_id: input.orgId,
        warehouse_id: input.warehouseId,
        status: "open",
        created_by: input.userId,
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      orgId: data.org_id,
      warehouseId: data.warehouse_id,
      status: data.status,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      closedAt: data.closed_at ? new Date(data.closed_at) : null,
    };
  }

  async listByOrg(orgId: string): Promise<Inventory[]> {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from("inventories")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((d) => ({
      id: d.id,
      orgId: d.org_id,
      warehouseId: d.warehouse_id,
      status: d.status,
      createdBy: d.created_by,
      createdAt: new Date(d.created_at),
      closedAt: d.closed_at ? new Date(d.closed_at) : null,
    }));
  }

  async getWithItems(id: string): Promise<{ inventory: Inventory; items: any[] }> {
    const supabase = await getServerSupabase();
    const invRes = await supabase.from("inventories").select("*").eq("id", id).single();
    if (invRes.error || !invRes.data) throw invRes.error || new Error("Inventory not found");
    const itemsRes = await supabase
      .from("inventory_items")
      .select("id,product_id,counted_qty,system_qty,diff_qty,product:products(name,sku)")
      .eq("inventory_id", id)
      .order("product_id");
    if (itemsRes.error) throw itemsRes.error;
    return {
      inventory: {
        id: invRes.data.id,
        orgId: invRes.data.org_id,
        warehouseId: invRes.data.warehouse_id,
        status: invRes.data.status,
        createdBy: invRes.data.created_by,
        createdAt: new Date(invRes.data.created_at),
        closedAt: invRes.data.closed_at ? new Date(invRes.data.closed_at) : null,
      },
      items: (itemsRes.data ?? []).map((r) => ({
        id: r.id,
        productId: r.product_id,
        productName: r.product?.[0]?.name ?? "",
        productSku: r.product?.[0]?.sku ?? "",
        countedQty: r.counted_qty,
        systemQty: r.system_qty,
        diffQty: r.diff_qty,
      })),
    };
  }

  async upsertItem(input: {
    inventoryId: string;
    productId: string;
    countedQty: number;
  }): Promise<any> {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase.rpc("inventory_upsert_item", {
      p_inventory_id: input.inventoryId,
      p_product_id: input.productId,
      p_counted_qty: input.countedQty,
    });
    if (error) throw error;
    return data?.[0] ?? null;
  }

  async close(input: { inventoryId: string; userId: string }): Promise<void> {
    const supabase = await getServerSupabase();
    const { error } = await supabase.rpc("inventory_close", {
      p_inventory_id: input.inventoryId,
      p_closed_by: input.userId,
    });
    if (error) throw error;
  }
}
