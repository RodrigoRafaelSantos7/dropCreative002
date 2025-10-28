import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  projects: defineTable({
    userId: v.id("user"),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),

    updatedAt: v.number(), // Timestamo for Last Modification
    createdAt: v.number(), // Project creation timestamp
  }).index("by_userId", ["userId"]),
});

export default schema;
