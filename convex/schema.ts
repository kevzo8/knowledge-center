import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Simple auth (same pattern as rf-frozen-system, roles adapted)
  users: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("trainer"), v.literal("trainee")),
    displayName: v.string(),
    active: v.boolean(),
    createdBy: v.optional(v.string()),
  }).index("by_username", ["username"]),

  sessions: defineTable({
    token: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  // Curriculum outline — one row per training day
  days: defineTable({
    dayNo: v.number(),
    week: v.optional(v.number()),
    date: v.optional(v.string()),
    title: v.string(),
    summary: v.optional(v.string()),
    active: v.boolean(),
  }).index("by_dayNo", ["dayNo"]),

  // Lectures / slides / links attached to a day
  lectures: defineTable({
    dayId: v.id("days"),
    title: v.string(),
    kind: v.union(v.literal("slides"), v.literal("link"), v.literal("doc"), v.literal("video")),
    // Either a Convex storage file, or an external URL (Google Slides / SharePoint)
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    url: v.optional(v.string()),
    notes: v.optional(v.string()),
    order: v.number(),
  }).index("by_day", ["dayId"]),

  // Hands-on activities (e.g. KLONDIKE, War card game)
  activities: defineTable({
    dayId: v.optional(v.id("days")),
    title: v.string(),
    instructions: v.string(),
    points: v.number(),
    order: v.number(),
  }).index("by_day", ["dayId"]),

  // Quizzes / exams
  quizzes: defineTable({
    dayId: v.optional(v.id("days")),
    title: v.string(),
    description: v.optional(v.string()),
    points: v.number(),
    active: v.boolean(),
  }).index("by_day", ["dayId"]),

  questions: defineTable({
    quizId: v.id("quizzes"),
    prompt: v.string(),
    choices: v.array(v.string()),
    answerIndex: v.number(),
    points: v.number(),
    order: v.number(),
  }).index("by_quiz", ["quizId"]),

  // Gamified progress
  completions: defineTable({
    userId: v.id("users"),
    lectureId: v.optional(v.id("lectures")),
    activityId: v.optional(v.id("activities")),
    dayId: v.optional(v.id("days")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_lecture", ["userId", "lectureId"]),

  attempts: defineTable({
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    answers: v.array(v.number()),
    score: v.number(),
    total: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_quiz", ["userId", "quizId"]),

  xpEvents: defineTable({
    userId: v.id("users"),
    kind: v.union(
      v.literal("lecture"),
      v.literal("activity"),
      v.literal("quiz"),
      v.literal("bonus")
    ),
    refId: v.string(),
    xp: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
