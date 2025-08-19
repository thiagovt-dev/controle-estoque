import Link from "next/link";
import { getServerSupabase } from "@/infra/supabase/server";
import { SupabaseInventoryRepository } from "@/data/implementations/SupabaseInventoryRepository";
import { openInventory } from "@/actions/inventory";
import ActionForm from "@/components/ActionForm";
import { Button } from "@/components/ui/button";
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

export const metadata = { title: "Inventários" };

export default async function InventoryListPage() {
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

  const repo = new SupabaseInventoryRepository();
  const inventories = await repo.listByOrg(orgId);
  const { data: warehouses } = await supabase
    .from("warehouses")
    .select("id,name")
    .eq("org_id", orgId)
    .order("name");

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Abrir inventário</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionForm action={openInventory} successMessage="Inventário aberto" className="flex items-end gap-3">
            <input type="hidden" name="orgId" value={orgId} />
            <div className="grid gap-1">
              <Label htmlFor="warehouseId">Depósito</Label>
              <select
                id="warehouseId"
                name="warehouseId"
                className="border rounded px-3 py-2 text-sm">
                {(warehouses ?? []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Abrir inventário</Button>
          </ActionForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Depósito</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Fechado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventories.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.id.slice(0, 8)}</TableCell>
                  <TableCell>{inv.warehouseId}</TableCell>
                  <TableCell>{inv.status}</TableCell>
                  <TableCell>{inv.createdAt.toLocaleString()}</TableCell>
                  <TableCell>{inv.closedAt ? inv.closedAt.toLocaleString() : "-"}</TableCell>
                  <TableCell>
                    <Link className="underline" href={`/inventory/${inv.id}`}>
                      Abrir
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {inventories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Sem inventários
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
