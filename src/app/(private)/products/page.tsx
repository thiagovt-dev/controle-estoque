import { getServerSupabase } from "@/infra/supabase/server";
import { SupabaseProductRepository } from "@/data/implementations/SupabaseProductRepository";
import { ListProducts } from "@/domain/use-cases/ListProducts";
import { createProduct } from "@/actions/products";
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

export const metadata = { title: "Produtos" };

export default async function ProductsPage() {
  const supabase = await getServerSupabase();
  const [{ data: auth }, orgRes, unitsRes, categoriesRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("user_orgs").select("org_id").limit(1).single(),
    supabase.from("units").select("id,name").order("name"),
    supabase.from("categories").select("id,name").order("name"),
  ]);
  if (!auth?.user) return null;
  if (orgRes.error || !orgRes.data) return <div className="p-6">Organização não encontrada</div>;
  const orgId = orgRes.data.org_id as string;

  const repo = new SupabaseProductRepository();
  const list = new ListProducts(repo);
  const products = await list.execute(orgId);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo produto</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionForm action={createProduct} successMessage="Produto criado" className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input type="hidden" name="orgId" value={orgId} />
            <div className="md:col-span-2 grid gap-1">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" placeholder="SKU" />
            </div>
            <div className="md:col-span-3 grid gap-1">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" placeholder="Nome do produto" />
            </div>
            <div className="md:col-span-1 grid gap-1">
              <Label htmlFor="unitId">Unidade</Label>
              <select id="unitId" name="unitId" className="border rounded px-3 py-2 text-sm">
                {(unitsRes.data ?? []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 grid gap-1">
              <Label htmlFor="categoryId">Categoria</Label>
              <select
                id="categoryId"
                name="categoryId"
                className="border rounded px-3 py-2 text-sm">
                <option value="">Sem categoria</option>
                {(categoriesRes.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 grid gap-1">
              <Label htmlFor="minStock">Estoque mínimo</Label>
              <Input id="minStock" name="minStock" type="number" step="0.001" placeholder="0" />
            </div>
            <div className="md:col-span-1 grid gap-1">
              <Label htmlFor="active">Status</Label>
              <select id="active" name="active" className="border rounded px-3 py-2 text-sm">
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </div>
          </ActionForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Mín.</TableHead>
                <TableHead>Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.unitId}</TableCell>
                  <TableCell>{p.minStock}</TableCell>
                  <TableCell>{p.active ? "Sim" : "Não"}</TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Sem produtos
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
