import { z } from "zod";

// Auth
export const requestOtpSchema = z.object({
  email: z.string().email("כתובת מייל לא תקינה").toLowerCase(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().length(6, "קוד חייב להכיל 6 ספרות"),
});

// Users
export const createUserSchema = z.object({
  email: z.string().email("כתובת מייל לא תקינה"),
  name: z.string().optional(),
  role: z.enum(["user", "dept_manager", "admin"]),
  departmentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().uuid(),
});

// Departments
export const departmentSchema = z.object({
  name: z.string().min(1, "שם חובה"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  icon: z.string().optional(),
});

// Categories
export const categorySchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1, "שם חובה"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// Knowledge items
export const knowledgeItemSchema = z.object({
  categoryId: z.string().uuid("יש לבחור קטגוריה"),
  ownerDepartmentId: z.string().uuid("יש לבחור מדור"),
  title: z.string().min(1, "כותרת חובה"),
  summary: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["green", "yellow", "red"]).default("green"),
  statusNote: z.string().optional(),
  sourceNote: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Tickets
export const createTicketSchema = z.object({
  departmentId: z.string().uuid("יש לבחור מדור"),
  subject: z.string().min(1, "נושא חובה"),
  message: z.string().min(1, "תיאור חובה"),
  isAnonymous: z.boolean().default(false),
});

export const ticketMessageSchema = z.object({
  ticketId: z.string().uuid(),
  message: z.string().min(1, "הודעה חובה"),
  visibility: z.enum(["private", "shared"]).default("shared"),
});

// Forms
export const formSchema = z.object({
  formType: z.enum(["digital", "external"]).default("digital"),
  title: z.string().min(1, "כותרת חובה"),
  description: z.string().optional(),
  externalUrl: z.string().url("כתובת URL לא תקינה").optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  ownerDepartmentId: z.string().uuid().optional().nullable(),
  schema: z.any(),
  requiresSignature: z.boolean().default(false),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

// Contacts
export const contactSchema = z.object({
  departmentId: z.string().uuid("יש לבחור מדור"),
  name: z.string().min(1, "שם חובה"),
  roleTitle: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  isPublic: z.boolean().default(true),
});

// Links
export const linkSchema = z.object({
  title: z.string().min(1, "כותרת חובה"),
  url: z.string().url("כתובת URL לא תקינה"),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  ownerDepartmentId: z.string().uuid().optional().nullable(),
  icon: z.string().optional(),
});

// Search
export const searchSchema = z.object({
  q: z.string().min(1),
  type: z
    .enum(["all", "knowledge", "forms", "contacts", "links", "tickets"])
    .default("all"),
  page: z.number().int().positive().default(1),
});
