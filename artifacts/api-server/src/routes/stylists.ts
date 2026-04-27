import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, stylistsTable } from "@workspace/db";
import {
  ListStylistsResponse,
  GetStylistParams,
  GetStylistResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stylists", async (_req, res): Promise<void> => {
  const rows = await db.select().from(stylistsTable).orderBy(asc(stylistsTable.name));
  res.json(ListStylistsResponse.parse(rows));
});

router.get("/stylists/:id", async (req, res): Promise<void> => {
  const params = GetStylistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "bad_request", message: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(stylistsTable)
    .where(eq(stylistsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "not_found", message: "Stylist:in nicht gefunden" });
    return;
  }
  res.json(GetStylistResponse.parse(row));
});

export default router;
