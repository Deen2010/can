import { Router, type IRouter, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, customersTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  setSessionCookie,
  clearSessionCookie,
  publicCustomer,
  SESSION_COOKIE,
  type AuthenticatedRequest,
} from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "bad_request", message: parsed.error.message });
    return;
  }
  const { email, password, name, phone } = parsed.data;
  const normEmail = email.trim().toLowerCase();

  const [existing] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.email, normEmail));
  if (existing) {
    res
      .status(409)
      .json({ error: "email_taken", message: "Diese Mail ist schon registriert" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(customersTable)
    .values({
      email: normEmail,
      passwordHash,
      name: name.trim(),
      phone: phone?.trim() ?? "",
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "server_error", message: "Anlegen fehlgeschlagen" });
    return;
  }

  const { token, expiresAt } = await createSession(created.id);
  setSessionCookie(res, token, expiresAt);
  res.status(201).json({ customer: publicCustomer(created) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "bad_request", message: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const normEmail = email.trim().toLowerCase();

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.email, normEmail));
  if (!customer) {
    res
      .status(401)
      .json({ error: "invalid_credentials", message: "E-Mail oder Passwort falsch" });
    return;
  }
  const ok = await verifyPassword(password, customer.passwordHash);
  if (!ok) {
    res
      .status(401)
      .json({ error: "invalid_credentials", message: "E-Mail oder Passwort falsch" });
    return;
  }

  const { token, expiresAt } = await createSession(customer.id);
  setSessionCookie(res, token, expiresAt);
  res.status(200).json({ customer: publicCustomer(customer) });
});

router.post("/auth/logout", async (req, res: Response): Promise<void> => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await deleteSession(token);
  }
  clearSessionCookie(res);
  res.status(204).end();
});

router.get("/auth/me", async (req: AuthenticatedRequest, res): Promise<void> => {
  if (!req.customer) {
    res.status(200).json({ customer: null });
    return;
  }
  res.status(200).json({ customer: publicCustomer(req.customer) });
});

export default router;
