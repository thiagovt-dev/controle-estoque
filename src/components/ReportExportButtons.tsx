"use client";

import { useTransition, useState } from "react";
import { exportBalancesCSV, exportBalancesPDF } from "@/actions/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReportExportButtons({ warehouseId }: { warehouseId?: string }) {
  const [search, setSearch] = useState("");
  const [pending, start] = useTransition();

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onCsv = () =>
    start(async () => {
      const fd = new FormData();
      if (warehouseId) fd.append("warehouseId", warehouseId);
      if (search) fd.append("search", search);
      const res = await exportBalancesCSV(fd);
      const blob = new Blob([res.content], { type: "text/csv;charset=utf-8" });
      download(blob, res.filename);
    });

  const onPdf = () =>
    start(async () => {
      const fd = new FormData();
      if (warehouseId) fd.append("warehouseId", warehouseId);
      if (search) fd.append("search", search);
      const res = await exportBalancesPDF(fd);
      const bytes = Uint8Array.from(atob(res.base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      download(blob, res.filename);
    });

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por SKU ou nome"
      />
      <Button onClick={onCsv} disabled={pending}>
        {pending ? "Gerando..." : "Exportar CSV"}
      </Button>
      <Button onClick={onPdf} disabled={pending} variant="outline">
        {pending ? "Gerando..." : "Exportar PDF"}
      </Button>
    </div>
  );
}
