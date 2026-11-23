import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../lib/api";

type Aparelho = { id: number; marca: string; modelo: string; imei?: string; cor?: string; cliente: { nome: string } };
type Inputs = { marca: string; modelo: string; imei?: string; cor?: string; clienteId: string };

export default function Aparelhos() {
  const [aparelhos, setAparelhos] = useState<Aparelho[]>([]);
  const [clientes, setClientes] = useState<{ id: number; nome: string }[]>([]);
  const { register, handleSubmit, reset } = useForm<Inputs>();

  const carregar = () => api<Aparelho[]>("/aparelhos").then(setAparelhos);
  useEffect(() => { carregar(); api("/clientes").then(setClientes); }, []);

  async function incluir(data: Inputs) {
    const body = { ...data, clienteId: Number(data.clienteId), imei: data.imei || undefined, cor: data.cor || undefined };
    try {
      await api("/aparelhos", { method: "POST", body: JSON.stringify(body) });
      toast.success("Aparelho cadastrado");
      reset();
      carregar();
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <>
      <h2>Aparelhos</h2>
      <div className="card">
        <form className="linha" onSubmit={handleSubmit(incluir)}>
          <select {...register("clienteId", { required: true })}>
            <option value="">Cliente...</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <input placeholder="Marca" {...register("marca", { required: true })} />
          <input placeholder="Modelo" {...register("modelo", { required: true })} />
          <input placeholder="IMEI (15 dígitos)" {...register("imei")} />
          <input placeholder="Cor" {...register("cor")} />
          <button type="submit">Cadastrar</button>
        </form>
      </div>
      <table>
        <thead><tr><th>#</th><th>Cliente</th><th>Marca</th><th>Modelo</th><th>IMEI</th><th>Cor</th></tr></thead>
        <tbody>
          {aparelhos.map((a) => (
            <tr key={a.id}><td>{a.id}</td><td>{a.cliente.nome}</td><td>{a.marca}</td><td>{a.modelo}</td><td>{a.imei}</td><td>{a.cor}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
