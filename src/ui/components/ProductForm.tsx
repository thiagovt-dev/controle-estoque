"use client";

import { useTransition } from "react";
import { createProduct } from "../../actions/products";

export function ProductForm({
  orgId,
  units,
  categories,
}: {
  orgId: string;
  units: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  return (
    <form
      className="grid grid-cols-1 md:grid-cols-6 gap-3"
      action={(fd) => start(async () => { await createProduct(fd); })}>
      <input type="hidden" name="orgId" value={orgId} />
      <input name="sku" placeholder="SKU" className="border p-2 rounded md:col-span-2" />
      <input name="name" placeholder="Nome" className="border p-2 rounded md:col-span-3" />
      <select name="unitId" className="border p-2 rounded md:col-span-1">
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <select name="categoryId" className="border p-2 rounded md:col-span-2">
        <option value="">Sem categoria</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        name="minStock"
        placeholder="Estoque mínimo"
        type="number"
        step="0.001"
        className="border p-2 rounded md:col-span-2"
      />
      <select name="active" className="border p-2 rounded md:col-span-1">
        <option value="true">Ativo</option>
        <option value="false">Inativo</option>
      </select>
      <button disabled={pending} className="px-3 py-2 rounded bg-black text-white md:col-span-1">
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
