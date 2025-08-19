import Link from "next/link";
import { getServerSupabase } from "../../infra/supabase/server";
import { SupabaseRequestsRepository } from "../../data/implementations/SupabaseRequestsRepository";
import { RequestOpenForm } from "../../ui/components/RequestOpenForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";
export const metadata = { title: "Requisições" };

export default async function RequestsPage() {
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

  const [{ data: departments }, { data: warehouses }] = await Promise.all([
    supabase.from("departments").select("id,name").eq("org_id", orgId).order("name"),
    supabase.from("warehouses").select("id,name").eq("org_id", orgId).order("name"),
  ]);

  const repo = new SupabaseRequestsRepository();
  const requests = await repo.listByOrg(orgId);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Requisições por Setor</h1>
      <RequestOpenForm
        orgId={orgId}
        departments={departments ?? []}
        warehouses={warehouses ?? []}
      />

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Setor</th>
              <th className="text-left p-2">Depósito</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Criado em</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t">
                <td className="p-2">{req.id.slice(0, 8)}</td>
                <td className="p-2">{req.departmentId}</td>
                <td className="p-2">{req.warehouseId}</td>
                <td className="p-2">{req.status}</td>
                <td className="p-2">{req.createdAt.toLocaleString()}</td>
                <td className="p-2">
                  <Link
                    href={`/requests/${req.id}`}
                    className="px-2 py-1 rounded bg-neutral-900 text-white">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-neutral-500">
                  Sem requisições
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
