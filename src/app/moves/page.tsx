import { getServerSupabase } from "../../infra/supabase/server";
import { MoveForm } from "../../ui/components/MoveForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

export const metadata = { title: "Movimentações" };

export default async function MovesPage() {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return <div className="p-6">Acesso não autorizado</div>;
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
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Movimentações</h1>
      <MoveForm orgId={orgId} products={products ?? []} warehouses={warehouses ?? []} />
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="text-left p-2">Data</th>
              <th className="text-left p-2">Tipo</th>
              <th className="text-left p-2">Qtd</th>
              <th className="text-left p-2">Motivo</th>
              <th className="text-left p-2">Ref</th>
            </tr>
          </thead>
          <tbody>
            {(moves ?? []).map((m, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{new Date(m.created_at).toLocaleString()}</td>
                <td className="p-2">{m.type}</td>
                <td className="p-2">{Number(m.qty)}</td>
                <td className="p-2">{m.reason}</td>
                <td className="p-2">{m.ref_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
