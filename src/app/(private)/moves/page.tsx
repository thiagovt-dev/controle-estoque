import { getServerSupabase } from "@/infra/supabase/server";
import { createMove } from "@/actions/moves";
import ActionForm from "@/components/ActionForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Movimentações" };

export default async function MovesPage() {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;
  const org = await supabase
    .from("user_orgs")
    .select("org_id")
    .eq("user_id", auth.user.id)
    .limit(1)
    .single();
  if (org.error || !org.data) return <div className="p-6">Organização não encontrada</div>;
  const orgId = org.data.org_id as string;

  const [{ data: products }, { data: warehouses }, { data: moves }] = await Promise.all([
    supabase.from("products").select("id,name").eq("org_id", orgId).order("name"),
    supabase.from("warehouses").select("id,name").eq("org_id", orgId).order("name"),
    supabase
      .from("stock_moves")
      .select("created_at,type,qty,reason,ref_id")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Lançar movimentação</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionForm action={createMove} successMessage="Movimentação lançada" className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input type="hidden" name="orgId" value={orgId} />
            <div className="grid gap-1">
              <Label htmlFor="type">Tipo</Label>
              <select id="type" name="type" className="border rounded px-3 py-2 text-sm">
                <option value="IN">Entrada</option>
                <option value="OUT">Saída</option>
                <option value="TRANSFER">Transferência</option>
              </select>
            </div>
            <div className="md:col-span-2 grid gap-1">
              <Label htmlFor="productId">Produto</Label>
              <select id="productId" name="productId" className="border rounded px-3 py-2 text-sm">
                {(products ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="warehouseFromId">Origem</Label>
              <select
                id="warehouseFromId"
                name="warehouseFromId"
                className="border rounded px-3 py-2 text-sm">
                <option value="">Origem</option>
                {(warehouses ?? []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="warehouseToId">Destino</Label>
              <select
                id="warehouseToId"
                name="warehouseToId"
                className="border rounded px-3 py-2 text-sm">
                <option value="">Destino</option>
                {(warehouses ?? []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="qty">Qtd</Label>
              <Input id="qty" name="qty" type="number" step="0.001" placeholder="0" />
            </div>
            <div className="md:col-span-2 grid gap-1">
              <Label htmlFor="reason">Motivo</Label>
              <Input id="reason" name="reason" placeholder="Motivo" />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="refId">Ref.</Label>
              <Input id="refId" name="refId" placeholder="Opcional" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Lançar
              </Button>
            </div>
          </ActionForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Ref</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(moves ?? []).map((m, i) => (
                <TableRow key={i}>
                  <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
                  <TableCell>{m.type}</TableCell>
                  <TableCell className="text-right">{Number(m.qty)}</TableCell>
                  <TableCell>{m.reason}</TableCell>
                  <TableCell>{m.ref_id}</TableCell>
                </TableRow>
              ))}
              {(moves ?? []).length === 0 && (
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
