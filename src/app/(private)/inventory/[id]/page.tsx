import { getServerSupabase } from "@/infra/supabase/server";
import { SupabaseInventoryRepository } from "@/data/implementations/SupabaseInventoryRepository";
import { upsertInventoryItem, closeInventory } from "@/actions/inventory";
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

export const metadata = { title: "Inventário" };

export default async function InventoryDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;

  const repo = new SupabaseInventoryRepository();
  const { inventory, items } = await repo.getWithItems(params.id);
  const { data: products } = await supabase
    .from("products")
    .select("id,name,sku")
    .eq("org_id", inventory.orgId)
    .order("name");

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventário {inventory.id.slice(0, 8)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm mb-4">
            Status: <span className="font-medium">{inventory.status}</span>
          </div>

          {inventory.status === "open" && (
            <ActionForm
              action={upsertInventoryItem}
              successMessage="Item lançado"
              className="grid grid-cols-1 md:grid-cols-6 gap-3"
            >
              <input type="hidden" name="inventoryId" value={inventory.id} />
              <div className="md:col-span-3 grid gap-1">
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
              <div className="md:col-span-2 grid gap-1">
                <Label htmlFor="countedQty">Qtd contada</Label>
                <Input
                  id="countedQty"
                  name="countedQty"
                  type="number"
                  step="0.001"
                  placeholder="0"
                />
              </div>
              <div className="md:col-span-1 flex items-end">
                <Button type="submit" className="w-full">
                  Lançar
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
                  <TableHead className="text-right">Sistema</TableHead>
                  <TableHead className="text-right">Contado</TableHead>
                  <TableHead className="text-right">Diferença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell>{row.productSku}</TableCell>
                    <TableCell className="text-right">{row.systemQty ?? 0}</TableCell>
                    <TableCell className="text-right">{row.countedQty ?? 0}</TableCell>
                    <TableCell
                      className={`text-right ${
                        Number(row.diffQty) !== 0 ? "text-destructive" : ""
                      }`}>
                      {row.diffQty ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Sem itens
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {inventory.status === "open" && (
            <ActionForm action={closeInventory} successMessage="Inventário fechado e ajustado" className="mt-6">
              <input type="hidden" name="inventoryId" value={inventory.id} />
              <Button type="submit" variant="destructive">
                Fechar inventário e ajustar
              </Button>
            </ActionForm>
          )}

          {inventory.status === "closed" && (
            <div className="mt-4 text-sm text-green-700">
              Inventário fechado em {inventory.closedAt ? inventory.closedAt.toLocaleString() : ""}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
