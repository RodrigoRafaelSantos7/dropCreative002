import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  projects: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    sketchData: v.any(), // JSON Structure from Redux Shapes State
    thumbnail: v.optional(v.string()),
    isPublic: v.boolean(),
    styleGuide: v.optional(v.string()),

    projectNumber: v.number(), // Auto-incrementing project number per user

    lastModified: v.number(), // Timestamo for Last Modification
    createdAt: v.number(), // Project creation timestamp
  })
    .index("by_userId", ["userId"])
    .index("by_userId_lastModified", ["userId", "lastModified"]),

  projects_counters: defineTable({
    userId: v.string(),
    nextProjectNumber: v.number(), // Next available project number for this user
  }).index("by_userId", ["userId"]),
});

export default schema;
