import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validaId } from "../lib/validaId.js";

const router = Router();
router.param("id", validaId);

const clienteSchema = z.object({
  nome: z.string().min(2).max(60),
  telefone: z.string().min(8).max(20),
  email: z.string().email().optional(),
  cpf: z.string().length(14).optional(), // 000.000.000-00
});

router.get("/", async (_req, res) => {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });
  res.json(clientes);
});

router.get("/:id", async (req, res) => {
  const cliente = await prisma.cliente.findUnique({
    where: { id: Number(req.params.id) },
    include: { aparelhos: true, ordens: true },
  });
  if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });
  res.json(cliente);
});

router.post("/", async (req, res) => {
  const valida = clienteSchema.safeParse(req.body);
  if (!valida.success) return res.status(400).json({ erro: valida.error.flatten() });
  try {
    const cliente = await prisma.cliente.create({ data: valida.data });
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ erro: String(error) });
  }
});

router.put("/:id", async (req, res) => {
  const valida = clienteSchema.partial().safeParse(req.body);
  if (!valida.success) return res.status(400).json({ erro: valida.error.flatten() });
  try {
    const cliente = await prisma.cliente.update({
      where: { id: Number(req.params.id) },
      data: valida.data,
    });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ erro: String(error) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.cliente.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ erro: String(error) });
  }
});

export default router;
