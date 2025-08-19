import Link from "next/link";
import { getServerSupabase } from "@/infra/supabase/server";
import { SupabaseRequestsRepository } from "@/data/implementations/SupabaseRequestsRepository";
import { openRequest } from "@/actions/requests";
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

export const metadata = { title: "Requisições" };

export default async function RequestsPage() {
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

  const [{ data: departments }, { data: warehouses }] = await Promise.all([
    supabase.from("departments").select("id,name").eq("org_id", orgId).order("name"),
    supabase.from("warehouses").select("id,name").eq("org_id", orgId).order("name"),
  ]);

  const repo = new SupabaseRequestsRepository();
  const requests = await repo.listByOrg(orgId);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Abrir requisição</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionForm action={openRequest} successMessage="Requisição aberta" className="flex flex-col md:flex-row items-end gap-3">
            <input type="hidden" name="orgId" value={orgId} />
            <div className="grid gap-1">
              <Label htmlFor="departmentId">Setor</Label>
              <select
                id="departmentId"
                name="departmentId"
                className="border rounded px-3 py-2 text-sm">
                {(departments ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
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
            <Button type="submit">Abrir</Button>
          </ActionForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requisições</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Depósito</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.id.slice(0, 8)}</TableCell>
                  <TableCell>{req.departmentId}</TableCell>
                  <TableCell>{req.warehouseId}</TableCell>
                  <TableCell>{req.status}</TableCell>
                  <TableCell>{req.createdAt.toLocaleString()}</TableCell>
                  <TableCell>
                    <Link className="underline" href={`/requests/${req.id}`}>
                      Abrir
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Sem requisições
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
