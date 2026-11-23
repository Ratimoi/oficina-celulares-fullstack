import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface TokenPayload { usuarioId: number; nome: string }

declare global {
  namespace Express {
    interface Request { usuario?: TokenPayload }
  }
}

export function verificaToken(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não informado" });
  }
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET as string) as TokenPayload;
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}
