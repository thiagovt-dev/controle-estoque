"use server";

import { getServerSupabase } from "../infra/supabase/server";
import { SupabaseReportsRepository } from "../data/implementations/SupabaseReportsRepository";
import { balancesToCsv } from "../lib/csv";
import { balancesToPdf } from "../lib/pdf";

export async function exportBalancesCSV(formData: FormData) {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Unauthorized");

  const orgRes = await supabase
    .from("user_orgs")
    .select("org_id")
    .eq("user_id", auth.user.id)
    .limit(1)
    .single();
  if (orgRes.error || !orgRes.data) throw new Error("Organization not found");
  const orgId = orgRes.data.org_id as string;

  const warehouseId = String(formData.get("warehouseId") || "") || null;
  const search = String(formData.get("search") || "") || null;

  const repo = new SupabaseReportsRepository();
  const rows = await repo.getBalances(orgId, { warehouseId, search });

  const csv = balancesToCsv(rows);
  const filename = `balances_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;

  return { filename, content: csv };
}

export async function exportBalancesPDF(formData: FormData) {
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Unauthorized");

  const orgRes = await supabase
    .from("user_orgs")
    .select("org_id")
    .eq("user_id", auth.user.id)
    .limit(1)
    .single();
  if (orgRes.error || !orgRes.data) throw new Error("Organization not found");
  const orgId = orgRes.data.org_id as string;

  const orgNameRes = await supabase.from("organizations").select("name").eq("id", orgId).single();
  const orgName = orgNameRes.data?.name ?? "";

  const warehouseId = String(formData.get("warehouseId") || "") || null;
  const search = String(formData.get("search") || "") || null;

  const repo = new SupabaseReportsRepository();
  const rows = await repo.getBalances(orgId, { warehouseId, search });

  const pdfBytes = await balancesToPdf(rows, { title: "Inventory Balances by Warehouse", orgName });
  const base64 = Buffer.from(pdfBytes).toString("base64");
  const filename = `balances_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.pdf`;

  return { filename, base64 };
}
