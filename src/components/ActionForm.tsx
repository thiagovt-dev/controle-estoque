"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ActionResult = { success: boolean; error?: string };

type Props = {
  action: (formData: FormData) => Promise<ActionResult>;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
  children: React.ReactNode;
  onSuccess?: () => void;
};

export default function ActionForm({
  action,
  successMessage = "Operação realizada com sucesso",
  errorMessage = "Ocorreu um erro ao processar a ação",
  className,
  children,
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        const res = await action(formData);
        if (res?.success) {
          toast.success(successMessage);
          onSuccess?.();
          router.refresh();
        } else {
          toast.error(res?.error || errorMessage);
        }
      } catch (err: any) {
        toast.error(err?.message || errorMessage);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className} data-pending={isPending || undefined}>
      {children}
    </form>
  );
}
