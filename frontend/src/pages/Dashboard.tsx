import { useEffect, useState } from "react";
import { api, reais, statusLabel } from "../lib/api";

type Dados = {
  clientes: number;
  ordensEmAndamento: number;
  faturamentoMes: number;
  porStatus: { status: string; total: number }[];
};

export default function Dashboard() {
  const [dados, setDados] = useState<Dados | null>(null);

  useEffect(() => { api<Dados>("/dashboard").then(setDados); }, []);
  if (!dados) return <p>Carregando...</p>;

  return (
    <>
      <h2>Dashboard</h2>
      <div className="grid">
        <div className="card"><div>Clientes</div><div className="numero">{dados.clientes}</div></div>
        <div className="card"><div>OS em andamento</div><div className="numero">{dados.ordensEmAndamento}</div></div>
        <div className="card"><div>Faturamento do mês</div><div className="numero">{reais(dados.faturamentoMes)}</div></div>
      </div>
      <div className="card">
        <h3>Ordens por status</h3>
        <table>
          <tbody>
            {dados.porStatus.map((s) => (
              <tr key={s.status}><td><span className={`badge ${s.status}`}>{statusLabel[s.status]}</span></td><td>{s.total}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
