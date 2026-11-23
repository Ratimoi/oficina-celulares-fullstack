import { Router } from "express";
import { z } from "zod";
import { StatusOS, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { validaId } from "../lib/validaId.js";

const router = Router();
router.param("id", validaId);
router.param("itemId", validaId);

// Fluxo permitido de status (CANCELADA possível antes de ENTREGUE)
const proximos: Record<StatusOS, StatusOS[]> = {
  ABERTA: ["EM_ANALISE", "CANCELADA"],
  EM_ANALISE: ["AGUARDANDO_APROVACAO", "CANCELADA"],
  AGUARDANDO_APROVACAO: ["EM_CONSERTO", "CANCELADA"],
  EM_CONSERTO: ["PRONTA", "CANCELADA"],
  PRONTA: ["ENTREGUE", "CANCELADA"],
  ENTREGUE: [],
  CANCELADA: [],
};

const ordemSchema = z.object({
  clienteId: z.number().int().positive(),
  aparelhoId: z.number().int().positive(),
  defeito: z.string().min(5).max(255),
  previsao: z.coerce.date().optional(),
});

const itemSchema = z.object({
  servicoId: z.number().int().positive(),
  quantidade: z.number().int().positive().default(1),
});

async function recalculaTotal(tx: Prisma.TransactionClient, ordemId: number) {
  const itens = await tx.ordemServicoItem.findMany({ where: { ordemId } });
  const total = itens.reduce((soma, i) => soma.add(i.preco.mul(i.quantidade)), new Prisma.Decimal(0));
  return tx.ordemServico.update({ where: { id: ordemId }, data: { valorTotal: total } });
}

router.get("/", async (req, res) => {
  const status = req.query.status as StatusOS | undefined;
  if (status && !(status in proximos)) return res.status(400).json({ erro: "Status inválido" });
  const ordens = await prisma.ordemServico.findMany({
    where: status ? { status } : undefined,
    include: {
      cliente: { select: { nome: true, telefone: true } },
      aparelho: { select: { marca: true, modelo: true } },
    },
    orderBy: { dataEntrada: "desc" },
  });
  res.json(ordens);
});

router.get("/:id", async (req, res) => {
  const ordem = await prisma.ordemServico.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      cliente: true,
      aparelho: true,
      usuario: { select: { nome: true } },
      itens: { include: { servico: true } },
    },
  });
  if (!ordem) return res.status(404).json({ erro: "OS não encontrada" });
  res.json(ordem);
});

router.post("/", async (req, res) => {
  const valida = ordemSchema.safeParse(req.body);
  if (!valida.success) return res.status(400).json({ erro: valida.error.flatten() });
  const { clienteId, aparelhoId } = valida.data;

  const aparelho = await prisma.aparelho.findUnique({ where: { id: aparelhoId } });
  if (!aparelho || aparelho.clienteId !== clienteId) {
    return res.status(400).json({ erro: "Aparelho não pertence a este cliente" });
  }
  const ordem = await prisma.ordemServico.create({
    data: { ...valida.data, usuarioId: req.usuario!.usuarioId },
  });
  res.status(201).json(ordem);
});

router.patch("/:id/diagnostico", async (req, res) => {
  const diagnostico = z.string().min(3).max(255).safeParse(req.body?.diagnostico);
  if (!diagnostico.success) return res.status(400).json({ erro: "Diagnóstico inválido" });
  try {
    const ordem = await prisma.ordemServico.update({
      where: { id: Number(req.params.id) },
      data: { diagnostico: diagnostico.data },
    });
    res.json(ordem);
  } catch {
    res.status(404).json({ erro: "OS não encontrada" });
  }
});

router.patch("/:id/status", async (req, res) => {
  const novo = z.nativeEnum(StatusOS).safeParse(req.body?.status);
  if (!novo.success) return res.status(400).json({ erro: "Status inválido" });

  const ordem = await prisma.ordemServico.findUnique({ where: { id: Number(req.params.id) } });
  if (!ordem) return res.status(404).json({ erro: "OS não encontrada" });
  if (!proximos[ordem.status].includes(novo.data)) {
    return res.status(400).json({ erro: `Não é possível passar de ${ordem.status} para ${novo.data}` });
  }
  const atualizada = await prisma.ordemServico.update({
    where: { id: ordem.id },
    data: { status: novo.data, dataEntrega: novo.data === "ENTREGUE" ? new Date() : undefined },
  });
  res.json(atualizada);
});

router.post("/:id/itens", async (req, res) => {
  const ordemId = Number(req.params.id);
  const valida = itemSchema.safeParse(req.body);
  if (!valida.success) return res.status(400).json({ erro: valida.error.flatten() });

  const ordem = await prisma.ordemServico.findUnique({ where: { id: ordemId } });
  if (!ordem) return res.status(404).json({ erro: "OS não encontrada" });
  if (["ENTREGUE", "CANCELADA"].includes(ordem.status)) {
    return res.status(400).json({ erro: "OS encerrada não aceita itens" });
  }
  const servico = await prisma.servico.findUnique({ where: { id: valida.data.servicoId } });
  if (!servico || !servico.ativo) return res.status(400).json({ erro: "Serviço inválido" });

  const resultado = await prisma.$transaction(async (tx) => {
    await tx.ordemServicoItem.create({
      data: { ordemId, servicoId: servico.id, quantidade: valida.data.quantidade, preco: servico.preco },
    });
    return recalculaTotal(tx, ordemId);
  });
  res.status(201).json(resultado);
});

router.delete("/:id/itens/:itemId", async (req, res) => {
  const ordemId = Number(req.params.id);
  const itemId = Number(req.params.itemId);
  const item = await prisma.ordemServicoItem.findUnique({ where: { id: itemId } });
  if (!item || item.ordemId !== ordemId) return res.status(404).json({ erro: "Item não encontrado" });

  const resultado = await prisma.$transaction(async (tx) => {
    await tx.ordemServicoItem.delete({ where: { id: itemId } });
    return recalculaTotal(tx, ordemId);
  });
  res.json(resultado);
});

export default router;
