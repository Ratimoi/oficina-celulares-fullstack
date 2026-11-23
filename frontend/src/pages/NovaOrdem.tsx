import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";

type Inputs = { clienteId: string; aparelhoId: string; defeito: string; previsao?: string };

export default function NovaOrdem() {
  const [clientes, setClientes] = useState<{ id: number; nome: string }[]>([]);
  const [aparelhos, setAparelhos] = useState<{ id: number; marca: string; modelo: string }[]>([]);
  const { register, handleSubmit, watch } = useForm<Inputs>();
  const navigate = useNavigate();
  const clienteId = watch("clienteId");

  useEffect(() => { api("/clientes").then(setClientes); }, []);
  useEffect(() => {
    if (clienteId) api(`/aparelhos?clienteId=${clienteId}`).then(setAparelhos);
    else setAparelhos([]);
  }, [clienteId]);

  async function salvar(data: Inputs) {
    const body = {
      clienteId: Number(data.clienteId),
      aparelhoId: Number(data.aparelhoId),
      defeito: data.defeito,
      previsao: data.previsao || undefined,
    };
    try {
      const ordem = await api<{ id: number }>("/ordens", { method: "POST", body: JSON.stringify(body) });
      toast.success(`OS #${ordem.id} aberta`);
      navigate(`/ordens/${ordem.id}`);
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h2>Nova Ordem de Serviço</h2>
      <form onSubmit={handleSubmit(salvar)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <select {...register("clienteId", { required: true })}>
          <option value="">Cliente...</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select {...register("aparelhoId", { required: true })} disabled={!clienteId}>
          <option value="">Aparelho...</option>
          {aparelhos.map((a) => <option key={a.id} value={a.id}>{a.marca} {a.modelo}</option>)}
        </select>
        <textarea rows={3} placeholder="Defeito relatado pelo cliente" {...register("defeito", { required: true })} />
        <label>Previsão de entrega <input type="date" {...register("previsao")} /></label>
        <button type="submit">Abrir OS</button>
      </form>
    </div>
  );
}
