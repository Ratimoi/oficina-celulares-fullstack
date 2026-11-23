import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api, reais } from "../lib/api";

type Servico = { id: number; descricao: string; preco: string; ativo: boolean };
type Inputs = { descricao: string; preco: string };

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const { register, handleSubmit, reset } = useForm<Inputs>();

  const carregar = () => api<Servico[]>("/servicos").then(setServicos);
  useEffect(() => { carregar(); }, []);

  async function incluir(data: Inputs) {
    try {
      await api("/servicos", { method: "POST", body: JSON.stringify({ ...data, preco: Number(data.preco) }) });
      toast.success("Serviço cadastrado");
      reset();
      carregar();
    } catch (e) { toast.error((e as Error).message); }
  }

  async function desativar(id: number) {
    await api(`/servicos/${id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <>
      <h2>Serviços</h2>
      <div className="card">
        <form className="linha" onSubmit={handleSubmit(incluir)}>
          <input placeholder="Descrição (ex.: Troca de tela)" {...register("descricao", { required: true })} />
          <input type="number" step="0.01" placeholder="Preço" {...register("preco", { required: true })} />
          <button type="submit">Cadastrar</button>
        </form>
      </div>
      <table>
        <thead><tr><th>#</th><th>Descrição</th><th>Preço</th><th>Situação</th><th></th></tr></thead>
        <tbody>
          {servicos.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td><td>{s.descricao}</td><td>{reais(s.preco)}</td><td>{s.ativo ? "Ativo" : "Inativo"}</td>
              <td>{s.ativo && <button className="secundario" onClick={() => desativar(s.id)}>Desativar</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
