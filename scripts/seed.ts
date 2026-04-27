import { db, servicesTable, stylistsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const services = [
  {
    id: "svc-classic-cut",
    name: "Classic Cut",
    category: "Haarschnitt",
    description:
      "Klassischer Schnitt nach Wunsch — gewaschen, geschnitten, gestylt. Inkl. Nackenrasur.",
    durationMinutes: 45,
    priceCents: 2800,
  },
  {
    id: "svc-skin-fade",
    name: "Skin Fade",
    category: "Haarschnitt",
    description:
      "Sauberer Übergang von Haut zu Deckhaar. Präzise mit Maschine und Klinge gearbeitet.",
    durationMinutes: 60,
    priceCents: 3500,
  },
  {
    id: "svc-buzz-cut",
    name: "Buzz Cut",
    category: "Haarschnitt",
    description:
      "Komplett kurz, eine Länge. Schnell, sauber, klassisch.",
    durationMinutes: 25,
    priceCents: 1800,
  },
  {
    id: "svc-kids-cut",
    name: "Kids Cut",
    category: "Haarschnitt",
    description:
      "Haarschnitt für Kinder bis 12 Jahre. In Ruhe, mit Geduld.",
    durationMinutes: 30,
    priceCents: 2000,
  },
  {
    id: "svc-beard-trim",
    name: "Beard Trim",
    category: "Bart",
    description:
      "Bart in Form — Konturen mit der Klinge geschnitten, mit Bartöl gepflegt.",
    durationMinutes: 30,
    priceCents: 1800,
  },
  {
    id: "svc-hot-shave",
    name: "Hot Towel Shave",
    category: "Bart",
    description:
      "Klassische Nassrasur mit heißen Tüchern und offener Klinge. Das volle Programm.",
    durationMinutes: 45,
    priceCents: 3200,
  },
  {
    id: "svc-cut-beard",
    name: "Cut & Beard",
    category: "Kombi",
    description:
      "Haarschnitt plus Bartpflege im Paket. Alles in einer Sitzung.",
    durationMinutes: 75,
    priceCents: 4500,
  },
  {
    id: "svc-the-works",
    name: "The Works",
    category: "Kombi",
    description:
      "Schnitt, Hot Towel Shave und Styling. Das volle MAINUSCH-Erlebnis.",
    durationMinutes: 90,
    priceCents: 5800,
  },
];

const stylists = [
  {
    id: "stylist-can",
    name: "Can",
    role: "Master Barber · Founder",
    bio: "Can ist der Mann hinter MAINUSCH. Klassische Schnitte, präzise Fades und ehrliche Bartpflege — seit Jahren am Stuhl, mit Auge für jedes Detail.",
    imageUrl:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
    specialties: ["Skin Fade", "Hot Towel Shave", "Classic Cut"],
  },
  {
    id: "stylist-deniz",
    name: "Deniz",
    role: "Senior Barber",
    bio: "Deniz steht für moderne Schnitte und detailverliebte Bartkonturen. Nimmt sich Zeit, fragt nach, trifft den Look.",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80",
    specialties: ["Beard Trim", "Skin Fade", "Cut & Beard"],
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
  console.log(`  ✓ ${services.length} services upserted`);

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
  console.log(`  ✓ ${stylists.length} stylists upserted`);

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
