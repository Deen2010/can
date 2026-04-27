import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq, gt, and } from "drizzle-orm";
import { db, customersTable, sessionsTable, type Customer } from "@workspace/db";
import type { Request, Response, NextFunction } from "express";

export const SESSION_COOKIE = "mainusch_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(customerId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessionsTable).values({
    token,
    customerId,
    expiresAt,
  });
  return { token, expiresAt };
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
}

export async function getCustomerFromToken(
  token: string | undefined,
): Promise<Customer | null> {
  if (!token) return null;
  const [row] = await db
    .select({ customer: customersTable })
    .from(sessionsTable)
    .innerJoin(customersTable, eq(sessionsTable.customerId, customersTable.id))
    .where(
      and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, new Date())),
    );
  return row?.customer ?? null;
}

export function setSessionCookie(
  res: Response,
  token: string,
  expiresAt: Date,
): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    expires: expiresAt,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export interface AuthenticatedRequest extends Request {
  customer?: Customer;
}

export async function attachCustomer(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    req.customer = (await getCustomerFromToken(token)) ?? undefined;
  }
  next();
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.customer) {
    res
      .status(401)
      .json({ error: "unauthorized", message: "Bitte einloggen" });
    return;
  }
  next();
}

export function publicCustomer(c: Customer) {
  return {
    id: c.id,
    email: c.email,
    name: c.name,
    phone: c.phone,
    emailVerifiedAt: c.emailVerifiedAt
      ? c.emailVerifiedAt.toISOString()
      : null,
    createdAt: c.createdAt.toISOString(),
  };
}
