import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// APPG related schemas
export const appgSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string().optional(),
  purpose: z.string().optional(),
  total_benefits: z.number().optional(),
  benefits_in_kind: z.array(z.number()).optional(),
  benefits_details: z.array(z.any()).optional(),
  chair: z.string().optional(),
  members: z.number().optional(),
  status: z.string().optional(),
});

export const appgFileSchema = z.object({
  filename: z.string(),
  publication_date: z.string(),
  data: z.array(appgSchema),
});

export const comparisonResultSchema = z.object({
  newAppgs: z.array(z.object({
    id: z.string(),
    name: z.string(),
    appearedIn: z.string(),
    history: z.array(appgSchema.optional()),
    firstSeen: z.number(),
    lastSeen: z.number(),
  })),
  removedAppgs: z.array(z.object({
    id: z.string(),
    name: z.string(),
    lastSeenIn: z.string(),
    history: z.array(appgSchema.optional()),
    firstSeen: z.number(),
    lastSeen: z.number(),
  })),
  modifiedAppgs: z.array(z.object({
    id: z.string(),
    name: z.string(),
    history: z.array(appgSchema.optional()),
    firstSeen: z.number(),
    lastSeen: z.number(),
    changes: z.array(z.object({
      field: z.string(),
      from: z.any(),
      to: z.any(),
      period: z.number(),
    })),
  })),
  timeline: z.array(z.object({
    type: z.enum(['new', 'removed', 'modified']),
    period: z.number(),
    appg: z.object({
      id: z.string(),
      name: z.string(),
    }),
    description: z.string(),
  })),
  totalAppgs: z.number(),
  periods: z.number(),
  yearSummaries: z.array(z.object({
    year: z.string(),
    filename: z.string(),
    totalGroups: z.number(),
    totalBenefitsValue: z.number(),
    groupsWithBenefits: z.number(),
    period: z.number(),
  })).optional(),
  overallChanges: z.object({
    groupCountChange: z.number(),
    benefitsValueChange: z.number(),
    benefitsGroupsChange: z.number(),
    firstYear: z.string(),
    lastYear: z.string(),
  }).optional(),
});

export type APPG = z.infer<typeof appgSchema>;
export type APPGFile = z.infer<typeof appgFileSchema>;
export type ComparisonResult = z.infer<typeof comparisonResultSchema>;
