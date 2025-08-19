import { ZodError } from "zod";

function isNextRedirectError(error: any) {
  const d = error?.digest;
  return typeof d === "string" && d.startsWith("NEXT_REDIRECT");
}

export class ServerActionError extends Error {
  public status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "ServerActionError";
    this.status = status;
  }
}

export async function withErrorHandling<T>(
  action: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error: any) {
    // Preserve Next.js redirects triggered inside server actions
    if (isNextRedirectError(error)) {
      throw error;
    }

    console.error("Erro na Server Action:", error);

    if (error instanceof ServerActionError) {
      return { success: false, error: error.message };
    }

    // Zod validation errors
    if (error instanceof ZodError) {
      const first = error.issues?.[0];
      const msg = first?.message || "Dados inválidos. Verifique os campos e tente novamente.";
      return { success: false, error: msg };
    }

    const message =
      (typeof error?.message === "string" && error.message) ||
      "Ocorreu um erro inesperado. Tente novamente mais tarde.";

    return { success: false, error: message };
  }
}
