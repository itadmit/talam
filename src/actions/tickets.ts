"use server";

import { db } from "@/lib/db";
import {
  tickets,
  ticketMessages,
  communityQna,
  notifications,
  assets,
  users,
} from "@/lib/db/schema";
import { createTicketSchema, ticketMessageSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendTicketResponseEmail, sendTicketStatusEmail } from "@/lib/email";

export async function getTickets(params?: {
  status?: string;
  departmentId?: string;
  page?: number;
}) {
  const session = await requireAuth();
  const limit = 20;
  const offset = ((params?.page || 1) - 1) * limit;

  const conditions = [];

  // Filter by role
  if (session.user.role === "user") {
    conditions.push(eq(tickets.createdByUserId, session.user.id));
  } else if (
    session.user.role === "dept_manager" &&
    session.user.departmentId
  ) {
    conditions.push(eq(tickets.departmentId, session.user.departmentId));
  }

  if (params?.status) {
    conditions.push(
      eq(
        tickets.status,
        params.status as "open" | "in_progress" | "waiting" | "done"
      )
    );
  }

  if (params?.departmentId) {
    conditions.push(eq(tickets.departmentId, params.departmentId));
  }

  const items = await db.query.tickets.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      department: true,
      createdBy: true,
    },
    orderBy: [desc(tickets.createdAt)],
    limit,
    offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tickets)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return { items, total: Number(count), page: params?.page || 1, limit };
}

export async function getTicket(id: string) {
  const session = await requireAuth();

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, id),
    with: {
      department: true,
      createdBy: true,
      messages: {
        with: { sender: true },
        orderBy: [desc(ticketMessages.createdAt)],
      },
    },
  });

  if (!ticket) return null;

  // Check access
  if (
    session.user.role === "user" &&
    ticket.createdByUserId !== session.user.id
  ) {
    return null;
  }

  // Get attachments
  const ticketAssets = await db
    .select()
    .from(assets)
    .where(
      and(eq(assets.ownerType, "ticket"), eq(assets.ownerId, id))
    );

  return { ...ticket, assets: ticketAssets };
}

export async function createTicket(data: {
  departmentId: string;
  subject: string;
  message: string;
  isAnonymous?: boolean;
}) {
  const session = await requireAuth();
  const parsed = createTicketSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "נתונים לא תקינים" };
  }

  const [ticket] = await db
    .insert(tickets)
    .values({
      createdByUserId: session.user.id,
      departmentId: parsed.data.departmentId,
      subject: parsed.data.subject,
      isAnonymous: parsed.data.isAnonymous || false,
      status: "open",
    })
    .returning();

  // Add initial message
  await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    senderUserId: session.user.id,
    message: parsed.data.message,
    visibility: "shared",
  });

  revalidatePath("/tickets");
  return { ok: true, data: ticket };
}

export async function addTicketMessage(data: {
  ticketId: string;
  message: string;
  visibility?: "private" | "shared";
}) {
  const session = await requireAuth();
  const parsed = ticketMessageSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "נתונים לא תקינים" };
  }

  const [msg] = await db
    .insert(ticketMessages)
    .values({
      ticketId: parsed.data.ticketId,
      senderUserId: session.user.id,
      message: parsed.data.message,
      visibility: parsed.data.visibility || "shared",
    })
    .returning();

  // Get ticket to notify
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, data.ticketId),
  });

  // Notify ticket owner if response is from dept/admin
  if (
    ticket &&
    ticket.createdByUserId !== session.user.id &&
    data.visibility !== "private"
  ) {
    await db.insert(notifications).values({
      userId: ticket.createdByUserId,
      type: "ticket_response",
      title: "תגובה חדשה לפנייתך",
      message: `התקבלה תגובה בפנייה: ${ticket.subject}`,
      entityType: "ticket",
      entityId: ticket.id,
    });

    // Send email notification
    const owner = await db.query.users.findFirst({
      where: eq(users.id, ticket.createdByUserId),
    });
    if (owner?.email) {
      sendTicketResponseEmail(owner.email, ticket.subject, ticket.id).catch(
        (err) => console.error("Email send failed:", err)
      );
    }
  }

  revalidatePath(`/tickets/${data.ticketId}`);
  return { ok: true, data: msg };
}

export async function updateTicketStatus(
  id: string,
  status: "open" | "in_progress" | "waiting" | "done"
) {
  const session = await requireAuth();

  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (status === "done") {
    updateData.closedAt = new Date();
  }

  await db.update(tickets).set(updateData).where(eq(tickets.id, id));

  // Notify ticket owner
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, id),
  });

  if (ticket && ticket.createdByUserId !== session.user.id) {
    const statusLabels: Record<string, string> = {
      open: "פתוח",
      in_progress: "בטיפול",
      waiting: "ממתין",
      done: "הושלם",
    };
    await db.insert(notifications).values({
      userId: ticket.createdByUserId,
      type: "ticket_status",
      title: "עדכון סטטוס פנייה",
      message: `הפנייה "${ticket.subject}" עודכנה ל: ${statusLabels[status]}`,
      entityType: "ticket",
      entityId: ticket.id,
    });

    // Send email notification
    const owner = await db.query.users.findFirst({
      where: eq(users.id, ticket.createdByUserId),
    });
    if (owner?.email) {
      sendTicketStatusEmail(
        owner.email,
        ticket.subject,
        ticket.id,
        statusLabels[status]
      ).catch((err) => console.error("Email send failed:", err));
    }
  }

  revalidatePath(`/tickets/${id}`);
  revalidatePath("/tickets");
  return { ok: true };
}

export async function deleteTicket(id: string) {
  await requireAuth();

  // Delete messages first
  await db.delete(ticketMessages).where(eq(ticketMessages.ticketId, id));

  // Delete ticket
  await db.delete(tickets).where(eq(tickets.id, id));

  revalidatePath("/tickets");
  revalidatePath("/admin/tickets");
  return { ok: true };
}

export async function publishTicketToCommunity(
  id: string,
  data: { question: string; answer: string }
) {
  const session = await requireAuth();

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, id),
  });
  if (!ticket) return { ok: false, error: "פנייה לא נמצאה" };

  await db.update(tickets).set({ publishedToCommunity: true }).where(eq(tickets.id, id));

  await db.insert(communityQna).values({
    ticketId: id,
    question: data.question,
    answer: data.answer,
    approvedByUserId: session.user.id,
    departmentId: ticket.departmentId,
  });

  revalidatePath("/community");
  revalidatePath(`/tickets/${id}`);
  return { ok: true };
}
