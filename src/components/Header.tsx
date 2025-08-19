import Link from "next/link";
import { getServerSupabase } from "@/infra/supabase/server";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default async function Header() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  return (
    <header className="w-full border-b bg-background">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">
            Almox
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/products">Produtos</Link>
              <Link href="/moves">Movimentações</Link>
              <Link href="/inventory">Inventários</Link>
              <Link href="/requests">Requisições</Link>
              <Link href="/reports/balances">Relatórios</Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!user && (
            <>
              <Link href="/auth/sign-in">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>Começar</Button>
              </Link>
            </>
          )}
          {user && (
            <form action={signOutAction}>
              <Button type="submit" variant="outline">
                Sair
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
