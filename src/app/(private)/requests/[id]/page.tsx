import { getServerSupabase } from "@/infra/supabase/server";
import { SupabaseRequestsRepository } from "@/data/implementations/SupabaseRequestsRepository";
import { addRequestItem, approveRequest, rejectRequest } from "@/actions/requests";
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

export const metadata = { title: "Requisição" };

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;

  const repo = new SupabaseRequestsRepository();
  const { request, items } = await repo.getWithItems(params.id);
  const { data: products } = await supabase
    .from("products")
    .select("id,name,sku")
    .eq("org_id", request.orgId)
    .order("name");

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Requisição {request.id.slice(0, 8)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm mb-4">
            Status: <span className="font-medium">{request.status}</span>
          </div>

          {request.status === "pending" && (
            <ActionForm action={addRequestItem} successMessage="Item adicionado" className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <input type="hidden" name="requestId" value={request.id} />
              <div className="md:col-span-4 grid gap-1">
                <Label htmlFor="productId">Produto</Label>
                <select
                  id="productId"
                  name="productId"
                  className="border rounded px-3 py-2 text-sm">
                  {(products ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} • {p.sku}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1 grid gap-1">
                <Label htmlFor="qty">Qtd</Label>
                <Input id="qty" name="qty" type="number" step="0.001" placeholder="0" />
              </div>
              <div className="md:col-span-1 flex items-end">
                <Button type="submit" className="w-full">
                  Adicionar
                </Button>
              </div>
            </ActionForm>
          )}

          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell className="text-right">{row.qty}</TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Sem itens
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {request.status === "pending" && (
            <div className="mt-6 flex flex-col md:flex-row gap-3">
              <ActionForm action={approveRequest} successMessage="Requisição aprovada e estoque baixado">
                <input type="hidden" name="requestId" value={request.id} />
                <Button type="submit" className="bg-green-700 hover:bg-green-700/90">
                  Aprovar e baixar estoque
                </Button>
              </ActionForm>
              <ActionForm action={rejectRequest} successMessage="Requisição rejeitada" className="flex gap-2">
                <input type="hidden" name="requestId" value={request.id} />
                <Input name="reason" placeholder="Motivo da rejeição" />
                <Button type="submit" variant="destructive">
                  Rejeitar
                </Button>
              </ActionForm>
            </div>
          )}

          {request.status === "approved" && (
            <div className="mt-4 text-sm text-green-700">
              Aprovada em {request.approvedAt ? request.approvedAt.toLocaleString() : ""}
            </div>
          )}
          {request.status === "rejected" && (
            <div className="mt-4 text-sm text-red-700">
              Rejeitada em {request.rejectedAt ? request.rejectedAt.toLocaleString() : ""} •{" "}
              {request.rejectionReason ?? ""}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
