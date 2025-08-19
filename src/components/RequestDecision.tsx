"use client";

import { useTransition, useState } from "react";
import { approveRequest, rejectRequest } from "../actions/requests";

export function RequestDecision({
  requestId,
  disabled,
}: {
  requestId: string;
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();
  const [reason, setReason] = useState("");
  return (
    <div className="flex flex-col md:flex-row gap-3">
      <button
        disabled={pending || disabled}
        onClick={() =>
          start(async () => {
            const fd = new FormData();
            fd.append("requestId", requestId);
            await approveRequest(fd);
          })
        }
        className="px-3 py-2 rounded bg-green-700 text-white">
        {pending ? "Processando..." : "Aprovar e baixar estoque"}
      </button>

      <div className="flex gap-2">
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo da rejeição"
          className="border p-2 rounded"
        />
        <button
          disabled={pending || disabled || reason.trim().length === 0}
          onClick={() =>
            start(async () => {
              const fd = new FormData();
              fd.append("requestId", requestId);
              fd.append("reason", reason);
              await rejectRequest(fd);
            })
          }
          className="px-3 py-2 rounded bg-red-700 text-white">
          {pending ? "Processando..." : "Rejeitar"}
        </button>
      </div>
    </div>
  );
}
