import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Almoxarifado</h1>
      <div className="flex gap-3">
        <Link className="px-3 py-2 rounded bg-black text-white" href="/products">
          Produtos
        </Link>
        <Link className="px-3 py-2 rounded bg-black text-white" href="/moves">
          Movimentações
        </Link>
        <Link className="px-3 py-2 rounded bg-black text-white" href="/inventory">
          Inventários
        </Link>
        <Link className="px-3 py-2 rounded bg-black text-white" href="/reports/balances">
          Relatórios
        </Link>
      </div>
    </main>
  );
}
