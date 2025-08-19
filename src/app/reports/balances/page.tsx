import { getServerSupabase } from "../../../infra/supabase/server";
import { SupabaseReportsRepository } from "../../../data/implementations/SupabaseReportsRepository";
import { ReportExportButtons } from "../../../ui/components/ReportExportButtons";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";
export const metadata = { title: "Relatório de Saldos" };

export default async function BalancesReportPage() {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return <div className="p-6">Acesso não autorizado</div>;
  const orgRes = await supabase
    .from("user_orgs")
    .select("org_id")
    .eq("user_id", auth.user.id)
    .limit(1)
    .single();
  if (orgRes.error || !orgRes.data) return <div className="p-6">Organização não encontrada</div>;
  const orgId = orgRes.data.org_id as string;

  const [{ data: warehouses }, repo] = await Promise.all([
    supabase.from("warehouses").select("id,name").eq("org_id", orgId).order("name"),
    Promise.resolve(new SupabaseReportsRepository()),
  ]);

  const selectedWarehouse = warehouses?.[0]?.id as string | undefined;
  const rows = await repo.getBalances(orgId, { warehouseId: selectedWarehouse });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Relatório de Saldos por Depósito</h1>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <form className="flex items-center gap-3">
          <select
            name="warehouseId"
            defaultValue={selectedWarehouse}
            className="border p-2 rounded">
            {(warehouses ?? []).map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </form>
        <ReportExportButtons warehouseId={selectedWarehouse} />
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="text-left p-2">Depósito</th>
              <th className="text-left p-2">SKU</th>
              <th className="text-left p-2">Produto</th>
              <th className="text-left p-2">Unid.</th>
              <th className="text-right p-2">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.productId}-${r.warehouseId}-${i}`} className="border-t">
                <td className="p-2">{r.warehouseName}</td>
                <td className="p-2">{r.sku}</td>
                <td className="p-2">{r.productName}</td>
                <td className="p-2">{r.unit}</td>
                <td className="p-2 text-right">{r.qtyOnHand}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-4 text-center text-neutral-500" colSpan={5}>
                  Sem dados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
