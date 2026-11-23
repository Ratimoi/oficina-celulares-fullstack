import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Aparelhos from "./pages/Aparelhos";
import Servicos from "./pages/Servicos";
import Ordens from "./pages/Ordens";
import NovaOrdem from "./pages/NovaOrdem";
import OrdemDetalhe from "./pages/OrdemDetalhe";
import { getUsuario } from "./lib/api";

function Protegida({ children }: { children: React.ReactNode }) {
  return getUsuario() ? <>{children}</> : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protegida><App /></Protegida>}>
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="aparelhos" element={<Aparelhos />} />
          <Route path="servicos" element={<Servicos />} />
          <Route path="ordens" element={<Ordens />} />
          <Route path="ordens/nova" element={<NovaOrdem />} />
          <Route path="ordens/:id" element={<OrdemDetalhe />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
