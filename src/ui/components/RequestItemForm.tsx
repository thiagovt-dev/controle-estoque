"use client";

import { useTransition } from "react";
import { addRequestItem } from "../../actions/requests";

export function RequestItemForm({
  requestId,
  products,
}: {
  requestId: string;
  products: { id: string; name: string; sku: string }[];
}) {
  const [pending, start] = useTransition();
  return (
    <form
      action={(fd) => start(async () => { await addRequestItem(fd); })}
      className="grid grid-cols-1 md:grid-cols-6 gap-3">
      <input type="hidden" name="requestId" value={requestId} />
      <select name="productId" className="border p-2 rounded md:col-span-4">
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} • {p.sku}
          </option>
        ))}
      </select>
      <input
        name="qty"
        type="number"
        step="0.001"
        placeholder="Qtd"
        className="border p-2 rounded md:col-span-1"
      />
      <button disabled={pending} className="px-3 py-2 rounded bg-black text-white md:col-span-1">
        {pending ? "Adicionando..." : "Adicionar"}
      </button>
    </form>
  );
}
