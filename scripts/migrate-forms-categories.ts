/**
 * Migrates form categories: creates "טפסים" + "כללי", moves forms from קישורים.
 * Run: DATABASE_URL=... npx tsx scripts/migrate-forms-categories.ts
 */
import "dotenv/config";
import { db } from "../src/lib/db";
import { categories, forms } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function migrate() {
  let formsCat = await db.query.categories.findFirst({
    where: eq(categories.key, "forms"),
  });

  if (!formsCat) {
    const [inserted] = await db.insert(categories).values({
      key: "forms",
      name: "טפסים",
      description: "טפסים וקובצי PDF",
      icon: "FileText",
      color: "blue",
      order: 55,
    }).returning();
    formsCat = inserted;
    console.log("Created category: טפסים (forms)");
  }

  const linksCat = await db.query.categories.findFirst({
    where: eq(categories.key, "links"),
  });

  let generalCat = await db.query.categories.findFirst({
    where: eq(categories.parentId, formsCat.id),
  });
  if (!generalCat) {
    const [inserted] = await db.insert(categories).values({
      key: "forms_general",
      name: "כללי",
      parentId: formsCat.id,
      order: 0,
    }).returning();
    generalCat = inserted;
    console.log("Created category: כללי (under טפסים)");
  }

  if (linksCat) {
    const res = await db
      .update(forms)
      .set({ categoryId: generalCat.id })
      .where(eq(forms.categoryId, linksCat.id))
      .returning({ id: forms.id });
    if (res.length > 0) {
      console.log(`Moved ${res.length} forms from קישורים to כללי`);
    }
  }

  const dagama = await db.query.categories.findFirst({
    where: eq(categories.name, "דוגמא"),
  });
  if (dagama && linksCat && dagama.parentId === linksCat.id) {
    await db.update(categories).set({ parentId: formsCat.id }).where(eq(categories.id, dagama.id));
    console.log("Moved דוגמא from קישורים to טפסים");
  }

  console.log("Done.");
  process.exit(0);
}
migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
