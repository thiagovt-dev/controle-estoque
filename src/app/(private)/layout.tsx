import { redirect } from "next/navigation";
import { getServerSupabase } from "@/infra/supabase/server";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) redirect("/auth/sign-in");
  return <>{children}</>;
}
