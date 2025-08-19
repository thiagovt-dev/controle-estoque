import { getServerSupabase } from "../../../infra/supabase/server";
import { SupabaseRequestsRepository } from "../../../data/implementations/SupabaseRequestsRepository";
import { RequestItemForm } from "../../../ui/components/RequestItemForm";
import { RequestDecision } from "../../../ui/components/RequestDecision";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";
export const metadata = { title: "Detalhe da Requisição" };

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return <div className="p-6">Acesso não autorizado</div>;

  const repo = new SupabaseRequestsRepository();
  const { request, items } = await repo.getWithItems(params.id);

  const { data: products } = await supabase
    .from("products")
    .select("id,name,sku")
    .eq("org_id", request.orgId)
    .order("name");

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Requisição {request.id.slice(0, 8)}</h1>
        <div className="text-sm">
          Status: <span className="font-medium">{request.status}</span>
        </div>
      </div>

      {request.status === "pending" && (
        <RequestItemForm requestId={request.id} products={products ?? []} />
      )}

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="text-left p-2">Produto</th>
              <th className="text-left p-2">SKU</th>
              <th className="text-right p-2">Qtd</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-2">{row.productName}</td>
                <td className="p-2">{row.sku}</td>
                <td className="p-2 text-right">{row.qty}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-neutral-500">
                  Sem itens
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center">
        <RequestDecision requestId={request.id} disabled={request.status !== "pending"} />
      </div>

      {request.status === "approved" && (
        <div className="text-sm text-green-700">
          Aprovada em {request.approvedAt ? request.approvedAt.toLocaleString() : ""}
        </div>
      )}
      {request.status === "rejected" && (
        <div className="text-sm text-red-700">
          Rejeitada em {request.rejectedAt ? request.rejectedAt.toLocaleString() : ""} •{" "}
          {request.rejectionReason ?? ""}
        </div>
      )}
    </main>
  );
}
