/**
 * Ensures the "forms" category exists for form sub-categories.
 * Run: npx tsx scripts/ensure-forms-category.ts
 */
import "dotenv/config";
import { db } from "../src/lib/db";
import { categories } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function ensure() {
  const existing = await db.query.categories.findFirst({
    where: eq(categories.key, "forms"),
  });
  if (existing) {
    console.log("Category 'טפסים' (forms) already exists");
    process.exit(0);
  }
  await db.insert(categories).values({
    key: "forms",
    name: "טפסים",
    description: "טפסים וקובצי PDF",
    icon: "FileText",
    color: "blue",
    order: 55,
  });
  console.log("Created category 'טפסים' (forms)");
  process.exit(0);
}
ensure().catch((e) => {
  console.error(e);
  process.exit(1);
});
