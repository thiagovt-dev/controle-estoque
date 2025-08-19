import { getServerSupabase } from "@/infra/supabase/server";
import { SupabaseReportsRepository } from "@/data/implementations/SupabaseReportsRepository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportExportButtons } from "@/components/ReportExportButtons";

export const metadata = { title: "Relatório de Saldos" };

export default async function BalancesReportPage() {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;
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
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle>Relatório de Saldos por Depósito</CardTitle>
          <ReportExportButtons warehouseId={selectedWarehouse} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Depósito</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Unid.</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={`${r.productId}-${r.warehouseId}-${i}`}>
                  <TableCell>{r.warehouseName}</TableCell>
                  <TableCell>{r.sku}</TableCell>
                  <TableCell>{r.productName}</TableCell>
                  <TableCell>{r.unit}</TableCell>
                  <TableCell className="text-right">{r.qtyOnHand}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Sem dados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
