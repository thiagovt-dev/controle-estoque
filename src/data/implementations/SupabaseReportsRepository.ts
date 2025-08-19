import { getServerSupabase } from "../../infra/supabase/server";

export interface BalanceRow {
  warehouseId: string;
  warehouseName: string;
  productId: string;
  sku: string;
  productName: string;
  unit: string;
  qtyOnHand: number;
}

export class SupabaseReportsRepository {
  async getBalances(
    orgId: string,
    filters?: { warehouseId?: string | null; search?: string | null }
  ): Promise<BalanceRow[]> {
    const supabase = await getServerSupabase();
    let q = supabase
      .from("stock_items")
      .select(
        `
        product_id,
        warehouse_id,
        qty_on_hand,
        products:products(id, sku, name, unit_id),
        warehouses:warehouses(id, name),
        units:units!products_unit_id_fkey(id, code)
      `
      )
      .eq("org_id", orgId);

    if (filters?.warehouseId) q = q.eq("warehouse_id", filters.warehouseId);

    const { data, error } = await q;
    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      warehouseId: r.warehouses?.id as string,
      warehouseName: r.warehouses?.name as string,
      productId: r.products?.id as string,
      sku: r.products?.sku as string,
      productName: r.products?.name as string,
      unit: r.units?.code as string,
      qtyOnHand: Number(r.qty_on_hand ?? 0),
    })) as BalanceRow[];

    const term = (filters?.search ?? "").trim().toLowerCase();
    const filtered = term
      ? rows.filter((x) => `${x.sku} ${x.productName}`.toLowerCase().includes(term))
      : rows;

    return filtered.sort(
      (a, b) =>
        a.warehouseName.localeCompare(b.warehouseName) || a.productName.localeCompare(b.productName)
    );
  }
}
