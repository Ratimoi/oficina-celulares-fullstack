import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../lib/api";

type Cliente = { id: number; nome: string; telefone: string; email?: string; cpf?: string };
type Inputs = Omit<Cliente, "id">;

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const { register, handleSubmit, reset } = useForm<Inputs>();

  const carregar = () => api<Cliente[]>("/clientes").then(setClientes);
  useEffect(() => { carregar(); }, []);

  async function incluir(data: Inputs) {
    const body = { ...data, email: data.email || undefined, cpf: data.cpf || undefined };
    try {
      await api("/clientes", { method: "POST", body: JSON.stringify(body) });
      toast.success("Cliente cadastrado");
      reset();
      carregar();
    } catch (e) { toast.error((e as Error).message); }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir cliente?")) return;
    try {
      await api(`/clientes/${id}`, { method: "DELETE" });
      carregar();
    } catch { toast.error("Cliente possui aparelhos ou ordens"); }
  }

  return (
    <>
      <h2>Clientes</h2>
      <div className="card">
        <form className="linha" onSubmit={handleSubmit(incluir)}>
          <input placeholder="Nome" {...register("nome", { required: true })} />
          <input placeholder="Telefone" {...register("telefone", { required: true })} />
          <input placeholder="E-mail" {...register("email")} />
          <input placeholder="CPF (000.000.000-00)" {...register("cpf")} />
          <button type="submit">Cadastrar</button>
        </form>
      </div>
      <table>
        <thead><tr><th>#</th><th>Nome</th><th>Telefone</th><th>E-mail</th><th></th></tr></thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td><td>{c.nome}</td><td>{c.telefone}</td><td>{c.email}</td>
              <td><button className="perigo" onClick={() => excluir(c.id)}>Excluir</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
