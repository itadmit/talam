import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgresJs from "postgres";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  let db;
  if (connectionString.includes("neon.tech") || connectionString.includes("neon.")) {
    const sql = neon(connectionString);
    db = drizzleNeon(sql, { schema });
  } else {
    const client = postgresJs(connectionString);
    db = drizzlePostgres(client, { schema });
  }

  console.log("Seeding database...");

  // Create departments
  const departmentsData = [
    { name: 'משא"ן', description: "משאבי אנוש", icon: "Users" },
    { name: "בריאות", description: "מדור בריאות", icon: "Heart" },
    { name: "קהילה", description: "מדור קהילה", icon: "Users" },
    { name: "חוסן", description: "מדור חוסן", icon: "Shield" },
    { name: "תקשוב", description: "מדור תקשוב", icon: "Monitor" },
  ];

  const departments = [];
  for (const dept of departmentsData) {
    // Check if department already exists
    const existing = await db.query.departments.findFirst({
      where: (d, { eq }) => eq(d.name, dept.name),
    });
    if (existing) {
      departments.push(existing);
      console.log(`  Department already exists: ${dept.name}`);
    } else {
      const [d] = await db.insert(schema.departments).values(dept).returning();
      departments.push(d);
      console.log(`  Created department: ${dept.name}`);
    }
  }

  // Create categories
  const categoriesData = [
    { key: "hr", name: "משאבי אנוש", description: "מידע על זכויות, שכר, ימי מחלה ועוד", icon: "Users", color: "blue", order: 0 },
    { key: "health", name: "בריאות", description: "מידע רפואי, תורים וביטוח", icon: "Heart", color: "red", order: 1 },
    { key: "community", name: "קהילה", description: "אירועים, פעילויות ומידע קהילתי", icon: "Users", color: "green", order: 2 },
    { key: "resilience", name: "חוסן", description: "תמיכה נפשית ורווחה", icon: "Shield", color: "purple", order: 3 },
    { key: "contacts", name: "אנשי קשר", description: "ספריית אנשי קשר", icon: "Phone", color: "yellow", order: 4 },
    { key: "links", name: "קישורים", description: "קישורים שימושיים", icon: "Link2", color: "cyan", order: 5 },
    { key: "forms", name: "טפסים", description: "טפסים וקובצי PDF", icon: "FileText", color: "blue", order: 5.5 },
    { key: "testimonials", name: "עדויות", description: "סיפורים וחוויות", icon: "MessageSquare", color: "pink", order: 6 },
    { key: "dashboard", name: "טבלת קהילה", description: "מצב מידע ושקיפות", icon: "BarChart3", color: "orange", order: 7 },
  ];

  for (const cat of categoriesData) {
    const existing = await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.key, cat.key),
    });
    if (!existing) {
      await db.insert(schema.categories).values(cat);
      console.log(`  Created category: ${cat.name}`);
    } else {
      console.log(`  Category already exists: ${cat.name}`);
    }
  }

  // Create admin user + whitelist
  const adminEmail = "itadmit@gmail.com";
  
  await db
    .insert(schema.emailWhitelist)
    .values({ email: adminEmail, isActive: true })
    .onConflictDoNothing();

  const [adminUser] = await db
    .insert(schema.users)
    .values({
      email: adminEmail,
      name: "מנהל מערכת",
      role: "admin",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  if (adminUser) {
    console.log(`  Created admin user: ${adminEmail}`);
  }

  // Create some sample knowledge items
  const cats = await db.query.categories.findMany();
  const hrCat = cats.find((c) => c.key === "hr");
  const healthCat = cats.find((c) => c.key === "health");

  if (hrCat && departments[0]) {
    await db.insert(schema.knowledgeItems).values([
      {
        categoryId: hrCat.id,
        ownerDepartmentId: departments[0].id,
        title: "זכויות שכר דירה",
        summary: "מידע על זכאות לשכר דירה, תנאים ואופן ההגשה",
        content: "<h2>שכר דירה</h2><p>קצינים זכאים לסיוע בשכר דירה בהתאם לדרגה ומצב משפחתי.</p><h3>תנאי זכאות</h3><ul><li>קצין בשירות קבע</li><li>אינו מתגורר בבסיס</li><li>בעל חוזה שכירות תקף</li></ul>",
        status: "green",
        publishedAt: new Date(),
      },
      {
        categoryId: hrCat.id,
        ownerDepartmentId: departments[0].id,
        title: "ימי חופשה שנתית",
        summary: "פירוט ימי החופשה המגיעים לפי ותק ודרגה",
        content: "<h2>ימי חופשה</h2><p>כל קצין זכאי למספר ימי חופשה שנתיים בהתאם לוותק השירות שלו.</p>",
        status: "green",
        publishedAt: new Date(),
      },
      {
        categoryId: hrCat.id,
        ownerDepartmentId: departments[0].id,
        title: "מענק שחרור",
        summary: "מידע על מענק שחרור ותנאי הזכאות",
        status: "yellow",
        statusNote: "מעודכן חלקית - ממתין לאישור הנחיות חדשות",
        publishedAt: new Date(),
      },
    ]);
    console.log("  Created sample knowledge items");
  }

  if (healthCat && departments[1]) {
    await db.insert(schema.knowledgeItems).values([
      {
        categoryId: healthCat.id,
        ownerDepartmentId: departments[1].id,
        title: "ביטוח שיניים",
        summary: "מידע על תוכניות ביטוח שיניים ואופן המימוש",
        content: "<p>ביטוח שיניים מכסה טיפולים שמרניים ואורתודונטיה.</p>",
        status: "green",
        publishedAt: new Date(),
      },
      {
        categoryId: healthCat.id,
        ownerDepartmentId: departments[1].id,
        title: "בדיקות תקופתיות",
        summary: "לוח זמנים לבדיקות רפואיות תקופתיות",
        status: "red",
        statusNote: "חסר מידע מעודכן",
        publishedAt: new Date(),
      },
    ]);
  }

  // Create sample contacts
  for (const dept of departments.slice(0, 3)) {
    await db.insert(schema.contacts).values({
      departmentId: dept.id,
      name: `ראש מדור ${dept.name}`,
      roleTitle: "ראש מדור",
      phone: "03-1234567",
      email: `${dept.name.replace(/[^\w]/g, "")}@idf.il`,
      isPublic: true,
    });
  }
  console.log("  Created sample contacts");

  // Create a sample form
  if (hrCat && departments[0]) {
    await db.insert(schema.forms).values({
      categoryId: hrCat.id,
      ownerDepartmentId: departments[0].id,
      title: "בקשת חריג דיור",
      description: "טופס בקשה לחריג דיור מטעמים מיוחדים",
      schema: {
        fields: [
          { id: "full_name", type: "text", label: "שם מלא", required: true, width: "half" },
          { id: "id_number", type: "text", label: "מספר אישי", required: true, width: "half" },
          { id: "rank", type: "select", label: "דרגה", required: true, width: "half", options: [
            { label: "סגן", value: "lt" },
            { label: "סרן", value: "cpt" },
            { label: "רב סרן", value: "maj" },
            { label: "סא״ל", value: "ltc" },
          ]},
          { id: "reason_type", type: "radio", label: "סוג הבקשה", required: true, options: [
            { label: "מעבר דירה", value: "move" },
            { label: "הגדלת סכום", value: "increase" },
            { label: "חריג אחר", value: "other" },
          ]},
          { id: "details", type: "textarea", label: "פירוט הבקשה", required: true, placeholder: "תאר את הנסיבות המיוחדות..." },
          { id: "supporting_doc", type: "file", label: "מסמך תומך", required: false },
        ],
        settings: {
          submitLabel: "הגש בקשה",
          successMessage: "הבקשה הוגשה בהצלחה ותיבדק על ידי המדור",
          requiresSignature: true,
        },
      },
      requiresSignature: true,
      status: "active",
    });
    console.log("  Created sample form");
  }

  // Create sample links
  await db.insert(schema.links).values([
    { title: "אתר ביטוח לאומי", url: "https://www.btl.gov.il", description: "מידע על זכויות ביטוח לאומי" },
    { title: "שירות התעסוקה", url: "https://www.taasuka.gov.il", description: "שירותי תעסוקה והכשרה" },
    { title: "משרד הבריאות", url: "https://www.health.gov.il", description: "מידע רפואי ושירותי בריאות" },
  ]);
  console.log("  Created sample links");

  // Create chatbot settings
  const existingChatbot = await db.select().from(schema.chatbotSettings).limit(1);
  if (existingChatbot.length === 0) {
    await db.insert(schema.chatbotSettings).values({
      isActive: true,
      welcomeMessage: "שלום! אני כאן לעזור. בחר שאלה או כתוב חיפוש חופשי",
      quickQuestions: [
        { id: "q1", text: "מה הזכויות שלי בשכר דירה?", searchQuery: "שכר דירה זכויות", icon: "Home" },
        { id: "q2", text: "איך אני מגיש בקשה לימי חופשה?", searchQuery: "ימי חופשה בקשה", icon: "Calendar" },
        { id: "q3", text: "מידע על ביטוח שיניים", searchQuery: "ביטוח שיניים", icon: "Heart" },
        { id: "q4", text: "מה כולל מענק השחרור?", searchQuery: "מענק שחרור", icon: "Award" },
        { id: "q5", text: "איך מתאמים בדיקות רפואיות?", searchQuery: "בדיקות רפואיות", icon: "Stethoscope" },
      ],
    });
    console.log("  Created chatbot settings");
  }

  console.log("\nSeed completed successfully!");
  console.log(`\nAdmin user: ${adminEmail}`);
  console.log("You can login with OTP using this email.");
}

seed().catch(console.error);
