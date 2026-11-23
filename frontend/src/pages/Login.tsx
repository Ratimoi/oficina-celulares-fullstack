import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, setUsuario, Usuario } from "../lib/api";

type Inputs = { nome?: string; email: string; senha: string };

export default function Login() {
  const [cadastro, setCadastro] = useState(false);
  const { register, handleSubmit } = useForm<Inputs>();
  const navigate = useNavigate();

  async function enviar(data: Inputs) {
    try {
      if (cadastro) {
        await api("/usuarios", { method: "POST", body: JSON.stringify(data) });
        toast.success("Usuário criado, faça login");
        setCadastro(false);
        return;
      }
      const usuario = await api<Usuario>("/login", { method: "POST", body: JSON.stringify(data) });
      setUsuario(usuario);
      navigate("/");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="card login">
      <h2>{cadastro ? "Criar usuário" : "Entrar"}</h2>
      <form onSubmit={handleSubmit(enviar)}>
        {cadastro && <input placeholder="Nome" {...register("nome", { required: true })} />}
        <input type="email" placeholder="E-mail" {...register("email", { required: true })} />
        <input type="password" placeholder="Senha (8+, 1 maiúscula, 1 número)" {...register("senha", { required: true })} />
        <button type="submit">{cadastro ? "Cadastrar" : "Entrar"}</button>
        <button type="button" className="secundario" onClick={() => setCadastro(!cadastro)}>
          {cadastro ? "Já tenho conta" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
