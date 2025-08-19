import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSupabase } from "@/infra/supabase/server";

export default async function Home() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Controle de Almoxarifado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Gerencie produtos, movimentações, inventários e requisições por setor.
            </p>
            <div className="mt-4 flex gap-3">
              <Link href="/auth/sign-up">
                <Button>Começar agora</Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button variant="outline">Já tenho conta</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Catálogo</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/products">
            <Button>Produtos</Button>
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/moves">
            <Button>Movimentações</Button>
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Inventários</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/inventory">
            <Button>Inventários</Button>
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Requisições</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/requests">
            <Button>Requisições</Button>
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/reports/balances">
            <Button>Relatório de Saldos</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
