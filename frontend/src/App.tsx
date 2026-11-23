import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getUsuario, setUsuario } from "./lib/api";

export default function App() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  function sair() {
    setUsuario(null);
    navigate("/login");
  }

  return (
    <>
      <header>
        <strong>📱 Oficina de Celulares</strong>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/ordens">Ordens</NavLink>
        <NavLink to="/clientes">Clientes</NavLink>
        <NavLink to="/aparelhos">Aparelhos</NavLink>
        <NavLink to="/servicos">Serviços</NavLink>
        <span className="sair">{usuario?.nome} · <button className="secundario" onClick={sair}>Sair</button></span>
      </header>
      <main><Outlet /></main>
    </>
  );
}
