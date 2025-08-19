import { BalanceRow } from "../data/implementations/SupabaseReportsRepository";

export function balancesToCsv(rows: BalanceRow[]) {
  const header = ["Warehouse", "SKU", "Product", "Unit", "Qty"].join(";");
  const body = rows
    .map((r) => [r.warehouseName, r.sku, r.productName, r.unit, String(r.qtyOnHand)].join(";"))
    .join("\n");
  return [header, body].join("\n");
}
