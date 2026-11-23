import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [porStatus, faturamento, clientes, abertas] = await Promise.all([
    prisma.ordemServico.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.ordemServico.aggregate({
      where: { status: "ENTREGUE", dataEntrega: { gte: inicioMes } },
      _sum: { valorTotal: true },
    }),
    prisma.cliente.count(),
    prisma.ordemServico.count({ where: { status: { notIn: ["ENTREGUE", "CANCELADA"] } } }),
  ]);

  res.json({
    clientes,
    ordensEmAndamento: abertas,
    faturamentoMes: faturamento._sum.valorTotal ?? 0,
    porStatus: porStatus.map((s) => ({ status: s.status, total: s._count._all })),
  });
});

export default router;
