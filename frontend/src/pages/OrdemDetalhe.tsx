import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { api, proximosStatus, reais, statusLabel } from "../lib/api";

type Item = { id: number; quantidade: number; preco: string; servico: { descricao: string } };
type Ordem = {
  id: number; status: string; defeito: string; diagnostico?: string; valorTotal: string;
  dataEntrada: string; previsao?: string; dataEntrega?: string;
  cliente: { nome: string; telefone: string };
  aparelho: { marca: string; modelo: string; imei?: string };
  usuario: { nome: string };
  itens: Item[];
};
type Servico = { id: number; descricao: string; preco: string; ativo: boolean };

export default function OrdemDetalhe() {
  const { id } = useParams();
  const [ordem, setOrdem] = useState<Ordem | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoId, setServicoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [diagnostico, setDiagnostico] = useState("");

  const carregar = () => api<Ordem>(`/ordens/${id}`).then((o) => { setOrdem(o); setDiagnostico(o.diagnostico ?? ""); });
  useEffect(() => { carregar(); api<Servico[]>("/servicos").then((s) => setServicos(s.filter((x) => x.ativo))); }, [id]);

  async function acao(fn: () => Promise<unknown>, msg: string) {
    try { await fn(); toast.success(msg); carregar(); }
    catch (e) { toast.error((e as Error).message); }
  }

  if (!ordem) return <p>Carregando...</p>;
  const encerrada = ["ENTREGUE", "CANCELADA"].includes(ordem.status);

  return (
    <>
      <h2>OS #{ordem.id} <span className={`badge ${ordem.status}`}>{statusLabel[ordem.status]}</span></h2>
      <div className="grid">
        <div className="card"><b>Cliente</b><br />{ordem.cliente.nome}<br />{ordem.cliente.telefone}</div>
        <div className="card"><b>Aparelho</b><br />{ordem.aparelho.marca} {ordem.aparelho.modelo}<br />IMEI: {ordem.aparelho.imei ?? "-"}</div>
        <div className="card"><b>Datas</b><br />Entrada: {new Date(ordem.dataEntrada).toLocaleDateString("pt-BR")}
          <br />Previsão: {ordem.previsao ? new Date(ordem.previsao).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-"}
          <br />Entrega: {ordem.dataEntrega ? new Date(ordem.dataEntrega).toLocaleDateString("pt-BR") : "-"}</div>
      </div>

      <div className="card">
        <p><b>Defeito:</b> {ordem.defeito}</p>
        <form className="linha" onSubmit={(e) => { e.preventDefault(); acao(() => api(`/ordens/${id}/diagnostico`, { method: "PATCH", body: JSON.stringify({ diagnostico }) }), "Diagnóstico salvo"); }}>
          <input style={{ flex: 1 }} placeholder="Diagnóstico técnico" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} disabled={encerrada} />
          <button type="submit" disabled={encerrada}>Salvar diagnóstico</button>
        </form>
      </div>

      <div className="card">
        <h3>Serviços / peças</h3>
        {!encerrada && (
          <form className="linha" onSubmit={(e) => {
            e.preventDefault();
            if (!servicoId) return;
            acao(() => api(`/ordens/${id}/itens`, { method: "POST", body: JSON.stringify({ servicoId: Number(servicoId), quantidade }) }), "Item adicionado");
          }}>
            <select value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
              <option value="">Serviço...</option>
              {servicos.map((s) => <option key={s.id} value={s.id}>{s.descricao} — {reais(s.preco)}</option>)}
            </select>
            <input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} style={{ width: 80 }} />
            <button type="submit">Adicionar</button>
          </form>
        )}
        <table>
          <thead><tr><th>Serviço</th><th>Qtd</th><th>Preço</th><th>Subtotal</th><th></th></tr></thead>
          <tbody>
            {ordem.itens.map((i) => (
              <tr key={i.id}>
                <td>{i.servico.descricao}</td><td>{i.quantidade}</td><td>{reais(i.preco)}</td>
                <td>{reais(Number(i.preco) * i.quantidade)}</td>
                <td>{!encerrada && <button className="perigo" onClick={() => acao(() => api(`/ordens/${id}/itens/${i.id}`, { method: "DELETE" }), "Item removido")}>Remover</button>}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><th colSpan={3}>Total</th><th>{reais(ordem.valorTotal)}</th><th></th></tr></tfoot>
        </table>
      </div>

      {!encerrada && (
        <div className="card linha" style={{ display: "flex", gap: 8 }}>
          <b>Alterar status:</b>
          {proximosStatus[ordem.status].map((s) => (
            <button key={s} className={s === "CANCELADA" ? "perigo" : ""}
              onClick={() => acao(() => api(`/ordens/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: s }) }), `Status: ${statusLabel[s]}`)}>
              {statusLabel[s]}
            </button>
          ))}
        </div>
      )}
      <p style={{ color: "#64748b" }}>Aberta por {ordem.usuario.nome}</p>
    </>
  );
}
