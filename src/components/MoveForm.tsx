"use client";

import { useTransition } from "react";
import { createMove } from "../actions/moves";

export function MoveForm({
  orgId,
  products,
  warehouses,
}: {
  orgId: string;
  products: { id: string; name: string }[];
  warehouses: { id: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  return (
    <form
      className="grid grid-cols-1 md:grid-cols-6 gap-3"
      action={(fd) =>
        start(async () => {
          await createMove(fd);
        })
      }>
      <input type="hidden" name="orgId" value={orgId} />
      <select name="type" className="border p-2 rounded md:col-span-1">
        <option value="IN">Entrada</option>
        <option value="OUT">Saída</option>
        <option value="TRANSFER">Transferência</option>
      </select>
      <select name="productId" className="border p-2 rounded md:col-span-2">
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select name="warehouseFromId" className="border p-2 rounded md:col-span-1">
        <option value="">Origem</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      <select name="warehouseToId" className="border p-2 rounded md:col-span-1">
        <option value="">Destino</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
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
      <input name="reason" placeholder="Motivo" className="border p-2 rounded md:col-span-2" />
      <input name="refId" placeholder="Ref." className="border p-2 rounded md:col-span-1" />
      <button disabled={pending} className="px-3 py-2 rounded bg-black text-white md:col-span-1">
        {pending ? "Lançando..." : "Lançar"}
      </button>
    </form>
  );
}
