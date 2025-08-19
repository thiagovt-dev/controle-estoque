"use client";

import { useTransition } from "react";
import { openRequest } from "../actions/requests";

export function RequestOpenForm({
  orgId,
  departments,
  warehouses,
}: {
  orgId: string;
  departments: { id: string; name: string }[];
  warehouses: { id: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  return (
    <form
      action={(fd) =>
        start(async () => {
          await openRequest(fd);
        })
      }
      className="flex flex-col md:flex-row gap-3">
      <input type="hidden" name="orgId" value={orgId} />
      <select name="departmentId" className="border p-2 rounded">
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <select name="warehouseId" className="border p-2 rounded">
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      <button disabled={pending} className="px-3 py-2 rounded bg-black text-white">
        {pending ? "Abrindo..." : "Abrir requisição"}
      </button>
    </form>
  );
}
