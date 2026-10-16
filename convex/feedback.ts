import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function getSessionUser(ctx: any, token: string) {
  const s = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();
  if (!s || s.expiresAt < Date.now()) throw new Error("Not logged in");
  const u = await ctx.db.get(s.userId);
  if (!u || !u.active) throw new Error("Not logged in");
  return u;
}

async function requireStaff(ctx: any, token: string) {
  const u = await getSessionUser(ctx, token);
  if (u.role !== "admin" && u.role !== "trainer")
    throw new Error("Trainer or admin only");
  return u;
}

const kindValidator = v.union(
  v.literal("suggestion"),
  v.literal("comment"),
  v.literal("question")
);
const statusValidator = v.union(
  v.literal("open"),
  v.literal("answered"),
  v.literal("closed")
);

async function withReplies(ctx: any, threads: any[]) {
  return await Promise.all(
    threads.map(async (t) => {
      const replies = await ctx.db
        .query("feedbackReplies")
        .withIndex("by_feedback", (q: any) => q.eq("feedbackId", t._id))
        .collect();
      const withNames = [];
      for (const r of replies.sort((a: any, b: any) => a.createdAt - b.createdAt)) {
        const u = await ctx.db.get(r.userId);
        withNames.push({
          body: r.body,
          at: r.createdAt,
          by: u?.displayName ?? "staff",
          mine: String(r.userId) === String(t.userId),
        });
      }
      const author = await ctx.db.get(t.userId);
      return {
        _id: t._id,
        subject: t.subject,
        body: t.body,
        kind: t.kind,
        status: t.status,
        hasNewReply: t.hasNewReply,
        at: t.createdAt,
        author: author?.displayName ?? "trainee",
        username: author?.username ?? "?",
        replies: withNames,
      };
    })
  );
}

// ---------- Trainee ----------
export const submitThread = mutation({
  args: { token: v.string(), kind: kindValidator, subject: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    if (args.subject.trim().length < 3) throw new Error("Subject too short");
    if (args.body.trim().length < 5) throw new Error("Message too short");
    return await ctx.db.insert("feedback", {
      userId: u._id,
      kind: args.kind,
      subject: args.subject.trim().slice(0, 120),
      body: args.body.trim().slice(0, 2000),
      status: "open",
      hasNewReply: false,
      createdAt: Date.now(),
    });
  },
});

export const myThreads = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    const threads = await ctx.db
      .query("feedback")
      .withIndex("by_user", (q) => q.eq("userId", u._id))
      .collect();
    threads.sort((a, b) => b.createdAt - a.createdAt);
    return withReplies(ctx, threads);
  },
});

export const markSeen = mutation({
  args: { token: v.string(), feedbackId: v.id("feedback") },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    const t = await ctx.db.get(args.feedbackId);
    if (!t || String(t.userId) !== String(u._id)) throw new Error("Not yours");
    await ctx.db.patch(t._id, { hasNewReply: false });
    return true;
  },
});

export const replyOwn = mutation({
  args: { token: v.string(), feedbackId: v.id("feedback"), body: v.string() },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    const t = await ctx.db.get(args.feedbackId);
    if (!t || String(t.userId) !== String(u._id)) throw new Error("Not yours");
    if (args.body.trim().length < 2) throw new Error("Reply too short");
    if (t.status === "closed") throw new Error("Thread is closed");
    await ctx.db.insert("feedbackReplies", {
      feedbackId: t._id,
      userId: u._id,
      body: args.body.trim().slice(0, 2000),
      createdAt: Date.now(),
    });
    if (t.status === "answered") await ctx.db.patch(t._id, { status: "open" });
    return true;
  },
});

// ---------- Staff ----------
export const openCount = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const open = await ctx.db
      .query("feedback")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    return open.length;
  },
});

export const listThreads = query({
  args: { token: v.string(), status: v.optional(statusValidator) },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const threads = args.status
      ? await ctx.db
          .query("feedback")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .collect()
      : await ctx.db.query("feedback").collect();
    threads.sort((a, b) => b.createdAt - a.createdAt);
    return withReplies(ctx, threads);
  },
});

export const replyStaff = mutation({
  args: { token: v.string(), feedbackId: v.id("feedback"), body: v.string() },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.token);
    const t = await ctx.db.get(args.feedbackId);
    if (!t) throw new Error("Thread not found");
    if (args.body.trim().length < 2) throw new Error("Reply too short");
    await ctx.db.insert("feedbackReplies", {
      feedbackId: t._id,
      userId: staff._id,
      body: args.body.trim().slice(0, 2000),
      createdAt: Date.now(),
    });
    await ctx.db.patch(t._id, { status: "answered", hasNewReply: true });
    return true;
  },
});

export const setStatus = mutation({
  args: { token: v.string(), feedbackId: v.id("feedback"), status: statusValidator },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const t = await ctx.db.get(args.feedbackId);
    if (!t) throw new Error("Thread not found");
    await ctx.db.patch(t._id, { status: args.status });
    return true;
  },
});
