import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  projects: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    styleGuide: v.optional(v.string()),
    sketchData: v.any(), // JSON Structure from Redux Shapes State
    viewportData: v.optional(v.any()), // JSON Structure for viewpoer state (scale,...)
    generatedDesignData: v.optional(v.any()), // JSON Structure for generated UI components
    thumbnail: v.optional(v.string()),
    moodboardImages: v.optional(v.array(v.id("_storage"))), // Storage IDs for moodboard images
    inspirationImages: v.optional(v.array(v.id("_storage"))), // Storage IDs for inspiration images (max. 6).

    lastModified: v.number(), // Timestamo for Last Modification
    createdAt: v.number(), // Project creation timestamp
    isPublic: v.boolean(), // Project visibility for sharing with other users
    projectNumber: v.number(), // Auto-incrementing project number per user
  })
    .index("by_userId", ["userId"])
    .index("by_userId_lastModified", ["userId", "lastModified"]),

  projects_counters: defineTable({
    userId: v.string(),
    nextProjectNumber: v.number(), // Next available project number for this user
  }).index("by_userId", ["userId"]),
});

export default schema;
