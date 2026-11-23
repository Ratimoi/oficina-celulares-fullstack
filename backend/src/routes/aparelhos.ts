import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validaId } from "../lib/validaId.js";

const router = Router();
router.param("id", validaId);

const aparelhoSchema = z.object({
  marca: z.string().min(2).max(30),
  modelo: z.string().min(1).max(40),
  imei: z.string().regex(/^\d{15}$/, "IMEI deve ter 15 dígitos").optional(),
  cor: z.string().max(20).optional(),
  clienteId: z.number().int().positive(),
});

router.get("/", async (req, res) => {
  const clienteId = req.query.clienteId ? Number(req.query.clienteId) : undefined;
  const aparelhos = await prisma.aparelho.findMany({
    where: clienteId ? { clienteId } : undefined,
    include: { cliente: { select: { id: true, nome: true } } },
    orderBy: { id: "desc" },
  });
  res.json(aparelhos);
});

router.post("/", async (req, res) => {
  const valida = aparelhoSchema.safeParse(req.body);
  if (!valida.success) return res.status(400).json({ erro: valida.error.flatten() });
  try {
    const aparelho = await prisma.aparelho.create({ data: valida.data });
    res.status(201).json(aparelho);
  } catch (error) {
    res.status(400).json({ erro: "Cliente inexistente" });
  }
});

router.put("/:id", async (req, res) => {
  const valida = aparelhoSchema.partial().safeParse(req.body);
  if (!valida.success) return res.status(400).json({ erro: valida.error.flatten() });
  try {
    const aparelho = await prisma.aparelho.update({ where: { id: Number(req.params.id) }, data: valida.data });
    res.json(aparelho);
  } catch (error) {
    res.status(400).json({ erro: String(error) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.aparelho.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(400).json({ erro: "Aparelho possui ordens de serviço" });
  }
});

export default router;
