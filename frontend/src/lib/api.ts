const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type Usuario = { id: number; nome: string; email: string; token: string };

export function getUsuario(): Usuario | null {
  const dados = localStorage.getItem("usuario");
  return dados ? JSON.parse(dados) : null;
}

export function setUsuario(u: Usuario | null) {
  if (u) localStorage.setItem("usuario", JSON.stringify(u));
  else localStorage.removeItem("usuario");
}

export async function api<T = any>(rota: string, opcoes: RequestInit = {}): Promise<T> {
  const usuario = getUsuario();
  const resp = await fetch(`${apiUrl}${rota}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(usuario ? { Authorization: `Bearer ${usuario.token}` } : {}),
      ...opcoes.headers,
    },
  });
  if (resp.status === 401 && usuario) {
    setUsuario(null);
    window.location.href = "/login";
  }
  if (resp.status === 204) return undefined as T;
  const dados = await resp.json();
  if (!resp.ok) {
    const erro = typeof dados.erro === "string" ? dados.erro : "Dados inválidos";
    throw new Error(erro);
  }
  return dados;
}

export const statusLabel: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANALISE: "Em análise",
  AGUARDANDO_APROVACAO: "Aguardando aprovação",
  EM_CONSERTO: "Em conserto",
  PRONTA: "Pronta",
  ENTREGUE: "Entregue",
  CANCELADA: "Cancelada",
};

export const proximosStatus: Record<string, string[]> = {
  ABERTA: ["EM_ANALISE", "CANCELADA"],
  EM_ANALISE: ["AGUARDANDO_APROVACAO", "CANCELADA"],
  AGUARDANDO_APROVACAO: ["EM_CONSERTO", "CANCELADA"],
  EM_CONSERTO: ["PRONTA", "CANCELADA"],
  PRONTA: ["ENTREGUE", "CANCELADA"],
  ENTREGUE: [],
  CANCELADA: [],
};

export const reais = (v: number | string) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
