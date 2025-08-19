import { getServerSupabase } from "../../infra/supabase/server";
import { SupabaseProductRepository } from "../../data/implementations/SupabaseProductRepository";
import { ListProducts } from "../../domain/use-cases/ListProducts";
import { ProductForm } from "../../ui/components/ProductForm";
import { TAGS } from "../../lib/cacheTags";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

export const metadata = { title: "Produtos" };

export default async function ProductsPage() {
  const supabase = await getServerSupabase();
  const [{ data: auth }, { data: units }, { data: categories }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("units").select("id,name").order("name"),
    supabase.from("categories").select("id,name").order("name"),
  ]);
  if (!auth.user) return <div className="p-6">Acesso não autorizado</div>;
  const orgRes = await supabase
    .from("user_orgs")
    .select("org_id")
    .eq("user_id", auth.user.id)
    .limit(1)
    .single();
  if (orgRes.error || !orgRes.data) return <div className="p-6">Organização não encontrada</div>;
  const orgId = orgRes.data.org_id as string;
  const repo = new SupabaseProductRepository();
  const useCase = new ListProducts(repo);
  const products = await useCase.execute(orgId);
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Produtos</h1>
      <ProductForm orgId={orgId} units={units ?? []} categories={categories ?? []} />
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="text-left p-2">SKU</th>
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">Unidade</th>
              <th className="text-left p-2">Mín.</th>
              <th className="text-left p-2">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.sku}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.unitId}</td>
                <td className="p-2">{p.minStock}</td>
                <td className="p-2">{p.active ? "Sim" : "Não"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-neutral-500">Tags de cache: {TAGS.products}</div>
    </main>
  );
}
