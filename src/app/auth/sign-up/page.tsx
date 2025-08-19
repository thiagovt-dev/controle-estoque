import Link from "next/link";
import { signUpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Criar conta" };

export default function SignUpPage() {
  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signUpAction} className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="name">Seu nome</Label>
              <Input id="name" name="name" placeholder="Seu nome" required />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="orgName">Organização</Label>
              <Input id="orgName" name="orgName" placeholder="Minha Secretaria" required />
            </div>
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
              Criar e entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/auth/sign-in" className="ml-1 underline">
            Entrar
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
