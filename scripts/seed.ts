import { db, servicesTable, stylistsTable } from "@workspace/db";
import { sql, notInArray } from "drizzle-orm";

const services = [
  {
    id: "svc-haircut",
    name: "Haircut",
    category: "Haarschnitt",
    description:
      "Klassischer Schnitt nach Wunsch — gewaschen, geschnitten, gestylt. Inkl. Nackenrasur.",
    durationMinutes: 30,
    priceCents: 500,
  },
  {
    id: "svc-haircut-bart",
    name: "Haircut & Bart",
    category: "Kombi",
    description:
      "Haarschnitt plus Bartpflege im Paket. Konturen mit der Klinge, alles in einer Sitzung.",
    durationMinutes: 45,
    priceCents: 700,
  },
];

const stylists = [
  {
    id: "stylist-can",
    name: "Can",
    role: "Master Barber · Founder",
    bio: "Can ist der Mann hinter GOETHE CUTS. Klassische Schnitte, präzise Fades und ehrliche Bartpflege — seit Jahren am Stuhl, mit Auge für jedes Detail.",
    imageUrl:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
    specialties: ["Haircut", "Bart", "Hot Towel"],
  },
];

async function main() {
  console.log("→ Seeding services...");
  for (const s of services) {
    await db
      .insert(servicesTable)
      .values(s)
      .onConflictDoUpdate({
        target: servicesTable.id,
        set: {
          name: s.name,
          category: s.category,
          description: s.description,
          durationMinutes: s.durationMinutes,
          priceCents: s.priceCents,
        },
      });
  }
  await db.delete(servicesTable).where(
    notInArray(
      servicesTable.id,
      services.map((s) => s.id),
    ),
  );
  console.log(`  ✓ ${services.length} services upserted (others removed)`);

  console.log("→ Seeding stylists...");
  for (const st of stylists) {
    await db
      .insert(stylistsTable)
      .values(st)
      .onConflictDoUpdate({
        target: stylistsTable.id,
        set: {
          name: st.name,
          role: st.role,
          bio: st.bio,
          imageUrl: st.imageUrl,
          specialties: st.specialties,
        },
      });
  }
  await db.delete(stylistsTable).where(
    notInArray(
      stylistsTable.id,
      stylists.map((s) => s.id),
    ),
  );
  console.log(`  ✓ ${stylists.length} stylists upserted (others removed)`);

  const counts = await db.execute(
    sql`SELECT (SELECT COUNT(*) FROM services) AS services, (SELECT COUNT(*) FROM stylists) AS stylists`,
  );
  console.log("→ Totals:", counts.rows[0]);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
