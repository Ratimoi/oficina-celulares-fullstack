import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import usuariosRoutes from "./routes/usuarios.js";
import clientesRoutes from "./routes/clientes.js";
import aparelhosRoutes from "./routes/aparelhos.js";
import servicosRoutes from "./routes/servicos.js";
import ordensRoutes from "./routes/ordens.js";
import dashboardRoutes from "./routes/dashboard.js";
import { verificaToken } from "./middlewares/verificaToken.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.send("API: Oficina de Conserto de Celulares"));

// Públicas
app.use("/", usuariosRoutes); // POST /usuarios, POST /login

// Protegidas (precisam de Authorization: Bearer <token>)
app.use("/clientes", verificaToken, clientesRoutes);
app.use("/aparelhos", verificaToken, aparelhosRoutes);
app.use("/servicos", verificaToken, servicosRoutes);
app.use("/ordens", verificaToken, ordensRoutes);
app.use("/dashboard", verificaToken, dashboardRoutes);

// Rede de segurança: qualquer erro não tratado vira 500 em vez de derrubar a API
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ erro: "Erro interno no servidor" });
});
process.on("unhandledRejection", (motivo) => console.error("Promise rejeitada sem tratamento:", motivo));

app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
