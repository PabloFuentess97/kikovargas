import jwt from "jsonwebtoken";
import type { Role } from "@/generated/prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

const SECRET = process.env.JWT_SECRET!;

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
