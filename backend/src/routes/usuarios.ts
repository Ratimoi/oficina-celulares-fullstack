import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();

const usuarioSchema = z.object({
  nome: z.string().min(2).max(60),
  email: z.string().email(),
  senha: z.string().min(8).regex(/[A-Z]/, "1 maiúscula").regex(/[0-9]/, "1 número"),
});

router.post("/usuarios", async (req, res) => {
  const valida = usuarioSchema.safeParse(req.body);
  if (!valida.success) return res.status(400).json({ erro: valida.error.flatten() });
  try {
    const hash = await bcrypt.hash(valida.data.senha, 12);
    const usuario = await prisma.usuario.create({
      data: { ...valida.data, senha: hash },
      select: { id: true, nome: true, email: true },
    });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ erro: "E-mail já cadastrado" });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body ?? {};
  const msgErro = "Login ou senha incorretos";
  if (!email || !senha) return res.status(400).json({ erro: msgErro });

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.status(400).json({ erro: msgErro });
  }
  const token = jwt.sign(
    { usuarioId: usuario.id, nome: usuario.nome },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" }
  );
  res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, token });
});

export default router;
