"use server";

import { db } from "@/lib/db";
import {
  users,
  emailWhitelist,
  departments,
  categories,
  contacts,
  links,
  forms,
  departmentDuty,
  auditLogs,
  tickets,
  knowledgeItems,
  formSubmissions,
  notifications,
  communityQna,
} from "@/lib/db/schema";
import { requireAdmin, requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import { eq, and, desc, sql, ilike, isNull, gte, lte, count as countFn } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==================== USERS ====================

export async function getUsers(params?: {
  q?: string;
  role?: string;
  departmentId?: string;
  page?: number;
}) {
  await requireAdmin();
  const limit = 20;
  const offset = ((params?.page || 1) - 1) * limit;

  const conditions = [];

  if (params?.q) {
    conditions.push(
      sql`(${users.email} ILIKE ${"%" + params.q + "%"} OR ${users.name} ILIKE ${"%" + params.q + "%"})`
    );
  }
  if (params?.role) {
    conditions.push(
      eq(users.role, params.role as "user" | "dept_manager" | "admin")
    );
  }
  if (params?.departmentId) {
    conditions.push(eq(users.departmentId, params.departmentId));
  }

  const items = await db.query.users.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { department: true },
    orderBy: [desc(users.createdAt)],
    limit,
    offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return { items, total: Number(count), page: params?.page || 1, limit };
}

export async function createUser(data: {
  email: string;
  name?: string;
  role: "user" | "dept_manager" | "admin";
  departmentId?: string | null;
  isActive?: boolean;
}) {
  await requireAdmin();

  // Create user
  const [user] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      name: data.name,
      role: data.role,
      departmentId: data.departmentId || null,
      isActive: data.isActive !== false,
    })
    .returning();

  // Add to whitelist
  const session = await requireAdmin();
  await db
    .insert(emailWhitelist)
    .values({
      email: data.email.toLowerCase(),
      addedByUserId: session.user.id,
      isActive: true,
    })
    .onConflictDoNothing();

  revalidatePath("/admin/users");
  return { ok: true, data: user };
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    role?: "user" | "dept_manager" | "admin";
    departmentId?: string | null;
    isActive?: boolean;
  }
) {
  await requireAdmin();

  await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id));

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUser(id: string) {
  await requireAdmin();
  await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.id, id));

  revalidatePath("/admin/users");
  return { ok: true };
}

// ==================== DEPARTMENTS ====================

export async function getDepartments() {
  return db.query.departments.findMany({
    orderBy: [departments.name],
  });
}

export async function createDepartment(data: {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  icon?: string;
}) {
  await requireAdmin();
  const [dept] = await db.insert(departments).values(data).returning();
  revalidatePath("/admin/departments");
  return { ok: true, data: dept };
}

export async function updateDepartment(
  id: string,
  data: {
    name?: string;
    description?: string;
    phone?: string;
    email?: string;
    icon?: string;
  }
) {
  await requireAdmin();
  await db
    .update(departments)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(departments.id, id));

  revalidatePath("/admin/departments");
  return { ok: true };
}

export async function deleteDepartment(id: string) {
  await requireAdmin();
  await db.delete(departments).where(eq(departments.id, id));
  revalidatePath("/admin/departments");
  return { ok: true };
}

// ==================== CATEGORIES ====================

export async function getCategories() {
  return db.query.categories.findMany({
    where: eq(categories.isActive, true),
    with: { parent: { columns: { id: true, name: true, key: true } } },
    orderBy: [categories.order, categories.name],
  });
}

/** קטגוריות לטפסים בלבד — טפסים + תת-קטגוריות */
export async function getCategoriesForForms() {
  const all = await getCategories();
  type Cat = (typeof all)[number];
  const formsRoot = all.find((c: Cat) => c.key === "forms");
  if (!formsRoot) return all;
  return all.filter(
    (c: Cat) =>
      c.id === formsRoot.id || (c.parent && (c.parent as { key?: string }).key === "forms")
  );
}

/** קטגוריות לקישורים בלבד — קישורים + תת-קטגוריות */
export async function getCategoriesForLinks() {
  const all = await getCategories();
  type Cat = (typeof all)[number];
  const linksRoot = all.find((c: Cat) => c.key === "links");
  if (!linksRoot) return all;
  return all.filter(
    (c: Cat) =>
      c.id === linksRoot.id || (c.parent && (c.parent as { key?: string }).key === "links")
  );
}

export async function getAllCategories() {
  return db.query.categories.findMany({
    with: { parent: { columns: { id: true, name: true } } },
    orderBy: [categories.order, categories.name],
  });
}

export async function createCategory(data: {
  key: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  parentId?: string | null;
}) {
  await requireAdmin();
  const [cat] = await db.insert(categories).values(data).returning();
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true, data: cat };
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    order?: number;
    isActive?: boolean;
    parentId?: string | null;
  }
) {
  await requireAdmin();
  await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id));

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  const knowledgeCount = await db
    .select({ count: countFn() })
    .from(knowledgeItems)
    .where(eq(knowledgeItems.categoryId, id));

  if ((knowledgeCount[0]?.count ?? 0) > 0) {
    return {
      ok: false,
      error: "לא ניתן למחוק קטגוריה עם פריטי ידע. יש להעביר או למחוק את פריטי הידע קודם.",
    };
  }

  await db.update(forms).set({ categoryId: null }).where(eq(forms.categoryId, id));
  await db.update(links).set({ categoryId: null }).where(eq(links.categoryId, id));
  await db.update(categories).set({ parentId: null }).where(eq(categories.parentId, id));
  await db.delete(categories).where(eq(categories.id, id));

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/forms");
  revalidatePath("/links");
  return { ok: true };
}

// ==================== CONTACTS ====================

export async function getContacts(params?: {
  departmentId?: string;
  q?: string;
}) {
  const conditions = [];

  if (params?.departmentId) {
    conditions.push(eq(contacts.departmentId, params.departmentId));
  }
  if (params?.q) {
    conditions.push(
      sql`(${contacts.name} ILIKE ${"%" + params.q + "%"} OR ${contacts.roleTitle} ILIKE ${"%" + params.q + "%"} OR ${contacts.notes} ILIKE ${"%" + params.q + "%"})`
    );
  }

  return db.query.contacts.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { department: true },
    orderBy: [contacts.name],
  });
}

export async function createContact(data: {
  departmentId: string;
  name: string;
  roleTitle?: string;
  phone?: string;
  email?: string;
  notes?: string;
  isPublic?: boolean;
}) {
  await requireDeptManagerOrAdmin();
  const [contact] = await db.insert(contacts).values(data).returning();
  revalidatePath("/contacts");
  revalidatePath("/admin/contacts");
  return { ok: true, data: contact };
}

export async function updateContact(
  id: string,
  data: {
    name?: string;
    roleTitle?: string;
    phone?: string;
    email?: string;
    notes?: string;
    isPublic?: boolean;
    departmentId?: string;
  }
) {
  await requireDeptManagerOrAdmin();
  await db
    .update(contacts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(contacts.id, id));

  revalidatePath("/contacts");
  revalidatePath("/admin/contacts");
  return { ok: true };
}

export async function deleteContact(id: string) {
  await requireDeptManagerOrAdmin();
  await db.delete(contacts).where(eq(contacts.id, id));
  revalidatePath("/contacts");
  revalidatePath("/admin/contacts");
  return { ok: true };
}

export async function setDutyContact(
  contactId: string,
  departmentId: string,
  endsAt?: Date
) {
  await requireDeptManagerOrAdmin();

  // Deactivate current duty
  await db
    .update(departmentDuty)
    .set({ isActive: false })
    .where(
      and(
        eq(departmentDuty.departmentId, departmentId),
        eq(departmentDuty.isActive, true)
      )
    );

  // Set new duty
  await db.insert(departmentDuty).values({
    contactId,
    departmentId,
    startsAt: new Date(),
    endsAt: endsAt || null,
    isActive: true,
  });

  revalidatePath("/contacts");
  revalidatePath("/community");
  return { ok: true };
}

// ==================== LINKS ====================

export async function getLinks(params?: {
  categoryId?: string;
  q?: string;
}) {
  const conditions = [isNull(links.deletedAt)];

  if (params?.categoryId) {
    conditions.push(eq(links.categoryId, params.categoryId));
  }
  if (params?.q) {
    conditions.push(
      sql`(${links.title} ILIKE ${"%" + params.q + "%"} OR ${links.description} ILIKE ${"%" + params.q + "%"})`
    );
  }

  return db.query.links.findMany({
    where: and(...conditions),
    with: {
      category: true,
      ownerDepartment: true,
    },
    orderBy: [desc(links.createdAt)],
  });
}

export async function createLink(data: {
  title: string;
  url: string;
  description?: string;
  categoryId?: string | null;
  ownerDepartmentId?: string | null;
  icon?: string;
}) {
  await requireDeptManagerOrAdmin();
  const [link] = await db.insert(links).values(data).returning();
  revalidatePath("/links");
  revalidatePath("/admin/links");
  return { ok: true, data: link };
}

export async function updateLink(
  id: string,
  data: {
    title?: string;
    url?: string;
    description?: string;
    categoryId?: string | null;
    ownerDepartmentId?: string | null;
    icon?: string;
  }
) {
  await requireDeptManagerOrAdmin();
  await db
    .update(links)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(links.id, id));

  revalidatePath("/links");
  revalidatePath("/admin/links");
  return { ok: true };
}

export async function deleteLink(id: string) {
  await requireDeptManagerOrAdmin();
  await db
    .update(links)
    .set({ deletedAt: new Date() })
    .where(eq(links.id, id));

  revalidatePath("/links");
  revalidatePath("/admin/links");
  return { ok: true };
}

// ==================== NOTIFICATIONS ====================

export async function getNotifications() {
  const session = await requireDeptManagerOrAdmin().catch(() => null);
  const authSession = session || (await (await import("@/lib/auth/helpers")).requireAuth());

  return db.query.notifications.findMany({
    where: eq(notifications.userId, authSession.user.id),
    orderBy: [desc(notifications.createdAt)],
    limit: 50,
  });
}

export async function markNotificationRead(id: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id));

  return { ok: true };
}

export async function markAllNotificationsRead() {
  const { requireAuth } = await import("@/lib/auth/helpers");
  const session = await requireAuth();

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, session.user.id),
        eq(notifications.isRead, false)
      )
    );

  return { ok: true };
}

// ==================== AUDIT LOGS ====================

export async function getAuditLogs(params?: {
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
}) {
  await requireAdmin();
  const limit = 50;
  const offset = ((params?.page || 1) - 1) * limit;

  const conditions = [];

  if (params?.userId) {
    conditions.push(eq(auditLogs.userId, params.userId));
  }
  if (params?.action) {
    conditions.push(eq(auditLogs.action, params.action));
  }
  if (params?.from) {
    conditions.push(gte(auditLogs.createdAt, new Date(params.from)));
  }
  if (params?.to) {
    conditions.push(lte(auditLogs.createdAt, new Date(params.to)));
  }

  const items = await db
    .select()
    .from(auditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return { items, page: params?.page || 1, limit };
}

export async function logAudit(data: {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values(data);
}

// ==================== METRICS ====================

export async function getMetrics() {
  await requireAdmin();

  const [userCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.isActive, true));

  const [ticketCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tickets);

  const [openTicketCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tickets)
    .where(eq(tickets.status, "open"));

  const [knowledgeCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(knowledgeItems)
    .where(isNull(knowledgeItems.deletedAt));

  const [submissionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(formSubmissions);

  // Recent logins (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [recentLogins] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.lastLoginAt, sevenDaysAgo));

  return {
    users: Number(userCount.count),
    tickets: Number(ticketCount.count),
    openTickets: Number(openTicketCount.count),
    knowledgeItems: Number(knowledgeCount.count),
    submissions: Number(submissionCount.count),
    recentLogins: Number(recentLogins.count),
  };
}

// ==================== COMMUNITY ====================

export async function getCommunityHealth() {
  const depts = await db.query.departments.findMany({
    with: {
      knowledgeItems: {
        where: isNull(knowledgeItems.deletedAt),
      },
      tickets: true,
      duties: {
        where: eq(departmentDuty.isActive, true),
        with: { contact: true },
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return depts.map((dept: any) => {
    const totalItems = dept.knowledgeItems.length;
    const redItems = dept.knowledgeItems.filter(
      (i: { status: string }) => i.status === "red"
    ).length;
    const yellowItems = dept.knowledgeItems.filter(
      (i: { status: string }) => i.status === "yellow"
    ).length;
    const greenItems = dept.knowledgeItems.filter(
      (i: { status: string }) => i.status === "green"
    ).length;
    const openTickets = dept.tickets.filter(
      (t: { status: string }) => t.status === "open" || t.status === "in_progress"
    ).length;
    const dutyContact = dept.duties[0]?.contact || null;

    // Health score: 100 base, -20 per red, -5 per yellow
    const healthScore = Math.max(
      0,
      Math.min(100, 100 - redItems * 20 - yellowItems * 5)
    );

    return {
      id: dept.id,
      name: dept.name,
      totalItems,
      redItems,
      yellowItems,
      greenItems,
      openTickets,
      healthScore,
      dutyContact,
    };
  });
}

export async function getCommunityQuestions(params?: {
  departmentId?: string;
  q?: string;
  page?: number;
}) {
  const limit = 20;
  const offset = ((params?.page || 1) - 1) * limit;

  const conditions = [];

  if (params?.departmentId) {
    conditions.push(eq(communityQna.departmentId, params.departmentId));
  }
  if (params?.q) {
    conditions.push(
      sql`(${communityQna.question} ILIKE ${"%" + params.q + "%"} OR ${communityQna.answer} ILIKE ${"%" + params.q + "%"})`
    );
  }

  return db.query.communityQna.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      department: true,
      approvedBy: true,
    },
    orderBy: [desc(communityQna.createdAt)],
    limit,
    offset,
  });
}
