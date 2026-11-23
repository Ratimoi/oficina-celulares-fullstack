import { Request, Response, NextFunction } from "express";

// Usado com router.param("id"/"itemId"): rejeita IDs não numéricos antes de chegar no Prisma
export function validaId(_req: Request, res: Response, next: NextFunction, valor: string) {
  if (!/^\d+$/.test(valor)) return res.status(400).json({ erro: "ID inválido" });
  next();
}
