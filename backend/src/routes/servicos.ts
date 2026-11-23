import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validaId } from "../lib/validaId.js";

const router = Router();
router.param("id", validaId);

const servicoSchema = z.object({
  descricao: z.string().min(3).max(60),
  preco: z.number().positive(),
  ativo: z.boolean().optional(),
});

router.get("/", async (_req, res) => {
  const servicos = await prisma.servico.findMany({ orderBy: { descricao: "asc" } });
  res.json(servicos);
});

router.post("/", async (req, res) => {
  const valida = servicoSchema.safeParse(req.body);
  if (!valida.success) return res.status(400).json({ erro: valida.error.flatten() });
  const servico = await prisma.servico.create({ data: valida.data });
  res.status(201).json(servico);
});

router.put("/:id", async (req, res) => {
  const valida = servicoSchema.partial().safeParse(req.body);
  if (!valida.success) return res.status(400).json({ erro: valida.error.flatten() });
  try {
    const servico = await prisma.servico.update({ where: { id: Number(req.params.id) }, data: valida.data });
    res.json(servico);
  } catch (error) {
    res.status(400).json({ erro: String(error) });
  }
});

// "Exclusão" lógica: serviços já usados em OS não podem sumir do histórico
router.delete("/:id", async (req, res) => {
  try {
    await prisma.servico.update({ where: { id: Number(req.params.id) }, data: { ativo: false } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ erro: String(error) });
  }
});

export default router;
