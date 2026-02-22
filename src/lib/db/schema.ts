import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "dept_manager",
  "admin",
]);

export const otpChannelEnum = pgEnum("otp_channel", ["email", "sms"]);

export const knowledgeStatusEnum = pgEnum("knowledge_status", [
  "green",
  "yellow",
  "red",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "waiting",
  "done",
]);

export const messageVisibilityEnum = pgEnum("message_visibility", [
  "private",
  "shared",
]);

export const formTypeEnum = pgEnum("form_type", ["digital", "external"]);

export const formStatusEnum = pgEnum("form_status", [
  "draft",
  "active",
  "archived",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "received",
  "in_review",
  "approved",
  "rejected",
]);

export const assetOwnerTypeEnum = pgEnum("asset_owner_type", [
  "knowledge",
  "ticket",
  "ticket_message",
  "form",
  "submission",
  "other",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "ticket_response",
  "ticket_status",
  "submission_status",
  "system",
  "info_update",
]);

// ==================== TABLES ====================

// 1) users
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    role: userRoleEnum("role").notNull().default("user"),
    departmentId: uuid("department_id").references(() => departments.id),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_department_idx").on(table.departmentId),
  ]
);

// 2) email_whitelist
export const emailWhitelist = pgTable(
  "email_whitelist",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    addedByUserId: uuid("added_by_user_id").references(() => users.id),
    isActive: boolean("is_active").notNull().default(true),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("whitelist_email_idx").on(table.email)]
);

// 3) otp_codes
export const otpCodes = pgTable(
  "otp_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    codeHash: varchar("code_hash", { length: 255 }).notNull(),
    channel: otpChannelEnum("channel").notNull().default("email"),
    expiresAt: timestamp("expires_at").notNull(),
    attempts: integer("attempts").notNull().default(0),
    consumedAt: timestamp("consumed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("otp_email_idx").on(table.email)]
);

// One-time token for verified OTP (bypasses Auth.js credentials parsing issues)
export const otpVerifyTokens = pgTable("otp_verify_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4) departments
export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  icon: varchar("icon", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5) department_duty
export const departmentDuty = pgTable(
  "department_duty",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("duty_department_idx").on(table.departmentId)]
);

// 6) categories
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 50 }),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 7) knowledge_items
export const knowledgeItems = pgTable(
  "knowledge_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    ownerDepartmentId: uuid("owner_department_id")
      .notNull()
      .references(() => departments.id),
    title: varchar("title", { length: 500 }).notNull(),
    summary: text("summary"),
    content: text("content"),
    status: knowledgeStatusEnum("status").notNull().default("green"),
    statusNote: text("status_note"),
    sourceNote: text("source_note"),
    updatedByUserId: uuid("updated_by_user_id").references(() => users.id),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("knowledge_category_idx").on(table.categoryId),
    index("knowledge_department_idx").on(table.ownerDepartmentId),
    index("knowledge_status_idx").on(table.status),
  ]
);

// 8) knowledge_tags
export const knowledgeTags = pgTable("knowledge_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

// 9) knowledge_item_tags (junction)
export const knowledgeItemTags = pgTable(
  "knowledge_item_tags",
  {
    knowledgeItemId: uuid("knowledge_item_id")
      .notNull()
      .references(() => knowledgeItems.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => knowledgeTags.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("kit_item_idx").on(table.knowledgeItemId),
    index("kit_tag_idx").on(table.tagId),
  ]
);

// 10) assets
export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerType: assetOwnerTypeEnum("owner_type").notNull(),
    ownerId: uuid("owner_id").notNull(),
    fileName: varchar("file_name", { length: 500 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }),
    size: integer("size"),
    storageKey: varchar("storage_key", { length: 1000 }).notNull(),
    storageUrl: text("storage_url"),
    uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("assets_owner_idx").on(table.ownerType, table.ownerId),
  ]
);

// 11) links
export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => categories.id),
    ownerDepartmentId: uuid("owner_department_id").references(
      () => departments.id
    ),
    title: varchar("title", { length: 500 }).notNull(),
    url: text("url").notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [index("links_category_idx").on(table.categoryId)]
);

// 12) contacts
export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id),
    name: varchar("name", { length: 255 }).notNull(),
    roleTitle: varchar("role_title", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 255 }),
    notes: text("notes"),
    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("contacts_department_idx").on(table.departmentId)]
);

// 13) tickets
export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id),
    subject: varchar("subject", { length: 500 }).notNull(),
    status: ticketStatusEnum("status").notNull().default("open"),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    formSubmissionId: uuid("form_submission_id"),
    publishedToCommunity: boolean("published_to_community")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    closedAt: timestamp("closed_at"),
  },
  (table) => [
    index("tickets_user_idx").on(table.createdByUserId),
    index("tickets_department_idx").on(table.departmentId),
    index("tickets_status_idx").on(table.status),
  ]
);

// 14) ticket_messages
export const ticketMessages = pgTable(
  "ticket_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    senderUserId: uuid("sender_user_id")
      .notNull()
      .references(() => users.id),
    message: text("message").notNull(),
    visibility: messageVisibilityEnum("visibility")
      .notNull()
      .default("shared"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("messages_ticket_idx").on(table.ticketId)]
);

// 15) community_qna
export const communityQna = pgTable(
  "community_qna",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketId: uuid("ticket_id").references(() => tickets.id),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id),
    departmentId: uuid("department_id").references(() => departments.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("qna_department_idx").on(table.departmentId)]
);

// 16) forms
export const forms = pgTable(
  "forms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => categories.id),
    ownerDepartmentId: uuid("owner_department_id").references(
      () => departments.id
    ),
    formType: formTypeEnum("form_type").notNull().default("digital"),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    externalUrl: text("external_url"),
    schema: jsonb("schema").$type<FormSchema>(),
    requiresSignature: boolean("requires_signature").notNull().default(false),
    status: formStatusEnum("status").notNull().default("draft"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("forms_category_idx").on(table.categoryId),
    index("forms_status_idx").on(table.status),
  ]
);

// 17) form_submissions
export const formSubmissions = pgTable(
  "form_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id),
    submittedByUserId: uuid("submitted_by_user_id")
      .notNull()
      .references(() => users.id),
    status: submissionStatusEnum("status").notNull().default("received"),
    answers: jsonb("answers").$type<Record<string, unknown>>(),
    signatureAssetId: uuid("signature_asset_id").references(() => assets.id),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    reviewedByUserId: uuid("reviewed_by_user_id").references(() => users.id),
    reviewNote: text("review_note"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("submissions_form_idx").on(table.formId),
    index("submissions_user_idx").on(table.submittedByUserId),
    index("submissions_status_idx").on(table.status),
  ]
);

// 18) notifications
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    message: text("message"),
    entityType: varchar("entity_type", { length: 100 }),
    entityId: uuid("entity_id"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),
    index("notifications_read_idx").on(table.userId, table.isRead),
  ]
);

// 19) audit_logs
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    action: varchar("action", { length: 255 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }),
    entityId: uuid("entity_id"),
    ip: varchar("ip", { length: 100 }),
    userAgent: text("user_agent"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_user_idx").on(table.userId),
    index("audit_action_idx").on(table.action),
    index("audit_created_idx").on(table.createdAt),
  ]
);

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  tickets: many(tickets),
  notifications: many(notifications),
  submissions: many(formSubmissions),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  users: many(users),
  contacts: many(contacts),
  knowledgeItems: many(knowledgeItems),
  tickets: many(tickets),
  duties: many(departmentDuty),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  knowledgeItems: many(knowledgeItems),
  forms: many(forms),
  links: many(links),
}));

export const knowledgeItemsRelations = relations(
  knowledgeItems,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [knowledgeItems.categoryId],
      references: [categories.id],
    }),
    ownerDepartment: one(departments, {
      fields: [knowledgeItems.ownerDepartmentId],
      references: [departments.id],
    }),
    updatedBy: one(users, {
      fields: [knowledgeItems.updatedByUserId],
      references: [users.id],
    }),
    itemTags: many(knowledgeItemTags),
  })
);

export const knowledgeItemTagsRelations = relations(
  knowledgeItemTags,
  ({ one }) => ({
    knowledgeItem: one(knowledgeItems, {
      fields: [knowledgeItemTags.knowledgeItemId],
      references: [knowledgeItems.id],
    }),
    tag: one(knowledgeTags, {
      fields: [knowledgeItemTags.tagId],
      references: [knowledgeTags.id],
    }),
  })
);

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [tickets.createdByUserId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [tickets.departmentId],
    references: [departments.id],
  }),
  messages: many(ticketMessages),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
  sender: one(users, {
    fields: [ticketMessages.senderUserId],
    references: [users.id],
  }),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  category: one(categories, {
    fields: [forms.categoryId],
    references: [categories.id],
  }),
  ownerDepartment: one(departments, {
    fields: [forms.ownerDepartmentId],
    references: [departments.id],
  }),
  submissions: many(formSubmissions),
}));

export const formSubmissionsRelations = relations(
  formSubmissions,
  ({ one }) => ({
    form: one(forms, {
      fields: [formSubmissions.formId],
      references: [forms.id],
    }),
    submittedBy: one(users, {
      fields: [formSubmissions.submittedByUserId],
      references: [users.id],
    }),
    reviewedBy: one(users, {
      fields: [formSubmissions.reviewedByUserId],
      references: [users.id],
    }),
    signatureAsset: one(assets, {
      fields: [formSubmissions.signatureAssetId],
      references: [assets.id],
    }),
  })
);

export const contactsRelations = relations(contacts, ({ one }) => ({
  department: one(departments, {
    fields: [contacts.departmentId],
    references: [departments.id],
  }),
}));

export const linksRelations = relations(links, ({ one }) => ({
  category: one(categories, {
    fields: [links.categoryId],
    references: [categories.id],
  }),
  ownerDepartment: one(departments, {
    fields: [links.ownerDepartmentId],
    references: [departments.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const departmentDutyRelations = relations(
  departmentDuty,
  ({ one }) => ({
    department: one(departments, {
      fields: [departmentDuty.departmentId],
      references: [departments.id],
    }),
    contact: one(contacts, {
      fields: [departmentDuty.contactId],
      references: [contacts.id],
    }),
  })
);

export const communityQnaRelations = relations(communityQna, ({ one }) => ({
  ticket: one(tickets, {
    fields: [communityQna.ticketId],
    references: [tickets.id],
  }),
  approvedBy: one(users, {
    fields: [communityQna.approvedByUserId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [communityQna.departmentId],
    references: [departments.id],
  }),
}));

// ==================== TYPES ====================

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "file"
  | "signature"
  | "header"
  | "paragraph";

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditionalOn?: {
    fieldId: string;
    value: string | boolean;
  };
  width?: "full" | "half";
}

export interface FormSchema {
  fields: FormField[];
  settings?: {
    submitLabel?: string;
    successMessage?: string;
    requiresSignature?: boolean;
  };
}

// ==================== CHATBOT ====================

export interface QuickQuestion {
  id: string;
  text: string;
  searchQuery: string;
  icon?: string;
}

export interface AIConfig {
  provider?: "openai" | "anthropic" | "custom";
  model?: string;
  apiKey?: string;
  systemPrompt?: string;
  temperature?: number;
  enabled: boolean;
}

export const chatbotSettings = pgTable("chatbot_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  isActive: boolean("is_active").notNull().default(true),
  welcomeMessage: text("welcome_message")
    .notNull()
    .default("שלום! אני כאן לעזור. בחר שאלה או כתוב חיפוש חופשי"),
  quickQuestions: jsonb("quick_questions")
    .notNull()
    .$type<QuickQuestion[]>()
    .default([]),
  aiConfig: jsonb("ai_config").$type<AIConfig>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ChatbotSettings = typeof chatbotSettings.$inferSelect;

// Infer types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type KnowledgeItem = typeof knowledgeItems.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type TicketMessage = typeof ticketMessages.$inferSelect;
export type Form = typeof forms.$inferSelect;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Link = typeof links.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type CommunityQna = typeof communityQna.$inferSelect;
