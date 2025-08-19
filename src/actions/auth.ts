"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getActionSupabase } from "@/infra/supabase/action";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signUpSchema = z.object({
  name: z.string().min(2),
  orgName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signInAction(formData: FormData) {
  const data = {
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  };
  const input = signInSchema.parse(data);
  const supabase = await getActionSupabase();
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) throw error;
  revalidatePath("/");
  redirect("/");
}

export async function signUpAction(formData: FormData) {
  const data = {
    name: String(formData.get("name") || ""),
    orgName: String(formData.get("orgName") || ""),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  };
  const input = signUpSchema.parse(data);
  const supabase = await getActionSupabase();
  const { data: res, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });
  if (error) throw error;
  const userId = res.user?.id;
  if (!userId) redirect("/auth/sign-in");
  const { data: org } = await supabase
    .from("organizations")
    .insert({ name: input.orgName })
    .select("id")
    .single();
  if (!org?.id) throw new Error("Organization not created");
  await supabase
    .from("user_orgs")
    .insert({ org_id: org.id, user_id: userId as string, role: "admin" });
  await supabase
    .from("profiles")
    .update({ email: input.email })
    .eq("id", userId as string);
  revalidatePath("/");
  redirect("/");
}

export async function signOutAction() {
  const supabase = await getActionSupabase();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/auth/sign-in");
}
