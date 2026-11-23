import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, reais, statusLabel } from "../lib/api";

type Ordem = {
  id: number; status: string; defeito: string; valorTotal: string; dataEntrada: string; previsao?: string;
  cliente: { nome: string }; aparelho: { marca: string; modelo: string };
};

export default function Ordens() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    api<Ordem[]>(`/ordens${filtro ? `?status=${filtro}` : ""}`).then(setOrdens);
  }, [filtro]);

  return (
    <>
      <h2>Ordens de Serviço</h2>
      <div className="card linha" style={{ display: "flex", gap: 8 }}>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <Link to="/ordens/nova"><button>+ Nova OS</button></Link>
      </div>
      <table>
        <thead><tr><th>OS</th><th>Entrada</th><th>Previsão</th><th>Cliente</th><th>Aparelho</th><th>Defeito</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>
          {ordens.map((o) => (
            <tr key={o.id}>
              <td><Link to={`/ordens/${o.id}`}>#{o.id}</Link></td>
              <td>{new Date(o.dataEntrada).toLocaleDateString("pt-BR")}</td>
              <td>{o.previsao ? new Date(o.previsao).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-"}</td>
              <td>{o.cliente.nome}</td>
              <td>{o.aparelho.marca} {o.aparelho.modelo}</td>
              <td>{o.defeito}</td>
              <td><span className={`badge ${o.status}`}>{statusLabel[o.status]}</span></td>
              <td>{reais(o.valorTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
