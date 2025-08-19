"use server";

import { getServerSupabase } from "../supabase/server";
import { Role } from "./roles";

export async function requireAuth() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) throw new Error("Unauthorized");
  return { supabase, userId: data.user.id };
}

export async function getUserRoleInOrg(orgId: string): Promise<Role | null> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("user_orgs")
    .select("role")
    .eq("org_id", orgId)
    .limit(1)
    .single();
  if (error) return null;
  return (data?.role ?? null) as Role | null;
}

export async function requireRole(allowed: Role[], orgId: string) {
  const { userId } = await requireAuth();
  const role = await getUserRoleInOrg(orgId);
  if (!role) throw new Error("Forbidden");
  if (!allowed.includes(role)) throw new Error("Forbidden");
  return { userId, role };
}
