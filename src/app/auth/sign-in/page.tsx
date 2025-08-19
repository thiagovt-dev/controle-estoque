import Link from "next/link";
import { signInAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Entrar" };

export default function SignInPage() {
  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signInAction} className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="you@email.com" required />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
              />
            </div>
            <Button type="submit" className="w-full mt-2">
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/auth/sign-up" className="ml-1 underline">
            Criar conta
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
