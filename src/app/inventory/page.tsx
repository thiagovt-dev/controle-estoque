import Link from "next/link";
import { getServerSupabase } from "../../infra/supabase/server";
import { SupabaseInventoryRepository } from "../../data/implementations/SupabaseInventoryRepository";
import { TAGS } from "../../lib/cacheTags";
import { openInventory } from "../../actions/inventory";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

export default async function InventoryListPage() {
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

  const repo = new SupabaseInventoryRepository();
  const inventories = await repo.listByOrg(orgId);
  const { data: warehouses } = await supabase
    .from("warehouses")
    .select("id,name")
    .eq("org_id", orgId)
    .order("name");

  async function actionOpenInventory(formData: FormData) {
    "use server";
    await openInventory(formData);
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Inventários</h1>
      <form action={actionOpenInventory} className="flex items-center gap-3">
        <input type="hidden" name="orgId" value={orgId} />
        <select name="warehouseId" className="border p-2 rounded">
          {(warehouses ?? []).map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <button className="px-3 py-2 rounded bg-black text-white">Abrir inventário</button>
      </form>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Depósito</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Criado em</th>
              <th className="text-left p-2">Fechado em</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {inventories.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="p-2">{inv.id.slice(0, 8)}</td>
                <td className="p-2">{inv.warehouseId}</td>
                <td className="p-2">{inv.status}</td>
                <td className="p-2">{inv.createdAt.toLocaleString()}</td>
                <td className="p-2">{inv.closedAt ? inv.closedAt.toLocaleString() : "-"}</td>
                <td className="p-2">
                  <Link
                    className="px-2 py-1 rounded bg-neutral-900 text-white"
                    href={`/inventory/${inv.id}`}>
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-neutral-500">Tags de cache: {TAGS.inventoryList}</div>
    </main>
  );
}
