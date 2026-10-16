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

// ---------- Days ----------
export const listDays = query({
  args: {},
  handler: async (ctx) => {
    const days = await ctx.db.query("days").collect();
    return days
      .filter((d) => d.active)
      .sort((a, b) => a.dayNo - b.dayNo);
  },
});

export const getDay = query({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.dayId);
  },
});

export const listDaysAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const days = await ctx.db.query("days").collect();
    return days.sort((a, b) => a.dayNo - b.dayNo);
  },
});

export const upsertDay = mutation({
  args: {
    token: v.string(),
    dayId: v.optional(v.id("days")),
    dayNo: v.number(),
    week: v.optional(v.number()),
    date: v.optional(v.string()),
    title: v.string(),
    summary: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    if (args.dayId) {
      await ctx.db.patch(args.dayId, {
        dayNo: args.dayNo,
        week: args.week,
        date: args.date,
        title: args.title,
        summary: args.summary,
        active: args.active ?? true,
      });
      return args.dayId;
    }
    return await ctx.db.insert("days", {
      dayNo: args.dayNo,
      week: args.week,
      date: args.date,
      title: args.title,
      summary: args.summary,
      active: args.active ?? true,
    });
  },
});

// ---------- Lectures ----------
export const listLectures = query({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("lectures")
      .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
      .collect();
    return rows.sort((a, b) => a.order - b.order);
  },
});

export const upsertLecture = mutation({
  args: {
    token: v.string(),
    lectureId: v.optional(v.id("lectures")),
    dayId: v.id("days"),
    title: v.string(),
    kind: v.union(
      v.literal("slides"),
      v.literal("link"),
      v.literal("doc"),
      v.literal("video")
    ),
    url: v.optional(v.string()),
    fileName: v.optional(v.string()),
    notes: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    if (args.lectureId) {
      await ctx.db.patch(args.lectureId, {
        dayId: args.dayId,
        title: args.title,
        kind: args.kind,
        url: args.url,
        fileName: args.fileName,
        notes: args.notes,
        order: args.order,
      });
      return args.lectureId;
    }
    return await ctx.db.insert("lectures", {
      dayId: args.dayId,
      title: args.title,
      kind: args.kind,
      url: args.url,
      fileName: args.fileName,
      notes: args.notes,
      order: args.order,
    });
  },
});

export const deleteLecture = mutation({
  args: { token: v.string(), lectureId: v.id("lectures") },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    // Cascade: completions + the XP they paid out.
    const completions = await ctx.db.query("completions").collect();
    for (const c of completions) {
      if (c.lectureId && String(c.lectureId) === String(args.lectureId)) {
        await ctx.db.delete(c._id);
      }
    }
    const xp = await ctx.db.query("xpEvents").collect();
    for (const e of xp) {
      if (e.kind === "lecture" && e.refId === String(args.lectureId)) {
        await ctx.db.delete(e._id);
      }
    }
    await ctx.db.delete(args.lectureId);
    return true;
  },
});

export const deleteActivity = mutation({
  args: { token: v.string(), activityId: v.id("activities") },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const completions = await ctx.db.query("completions").collect();
    for (const c of completions) {
      if (c.activityId && String(c.activityId) === String(args.activityId)) {
        await ctx.db.delete(c._id);
      }
    }
    const xp = await ctx.db.query("xpEvents").collect();
    for (const e of xp) {
      if (e.kind === "activity" && e.refId === String(args.activityId)) {
        await ctx.db.delete(e._id);
      }
    }
    // Unlink evaluations graded against this activity (their grades stand).
    const evals = await ctx.db.query("evaluations").collect();
    for (const e of evals) {
      if (e.activityId && String(e.activityId) === String(args.activityId)) {
        await ctx.db.patch(e._id, { activityId: undefined });
      }
    }
    await ctx.db.delete(args.activityId);
    return true;
  },
});

// Orphan audit: rows pointing at deleted parents.
export const auditOrphans = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const [lectures, activities, quizzes, questions, users, evaluations, rubrics] =
      await Promise.all([
        ctx.db.query("lectures").collect(),
        ctx.db.query("activities").collect(),
        ctx.db.query("quizzes").collect(),
        ctx.db.query("questions").collect(),
        ctx.db.query("users").collect(),
        ctx.db.query("evaluations").collect(),
        ctx.db.query("rubrics").collect(),
      ]);
    const has = (rows: any[], id: any) => rows.some((r) => String(r._id) === String(id));
    const completions = await ctx.db.query("completions").collect();
    const xp = await ctx.db.query("xpEvents").collect();
    const attempts = await ctx.db.query("attempts").collect();
    const grades = await ctx.db.query("grades").collect();
    const count = {
      completions: completions.filter(
        (c) =>
          (c.lectureId && !has(lectures, c.lectureId)) ||
          (c.activityId && !has(activities, c.activityId)) ||
          !has(users, c.userId)
      ).length,
      lectureXp: xp.filter((e) => e.kind === "lecture" && !has(lectures, e.refId)).length,
      activityXp: xp.filter((e) => e.kind === "activity" && !has(activities, e.refId)).length,
      quizXp: xp.filter(
        (e) => e.kind === "quiz" && !attempts.some((a) => String(a._id) === e.refId)
      ).length,
      evalXp: xp.filter(
        (e) =>
          e.kind === "evaluation" &&
          (e.refId.startsWith("eval:")
            ? !evaluations.some((ev) => `eval:${String(ev._id)}` === e.refId)
            : !grades.some((g) => String(g._id) === e.refId))
      ).length,
      attempts: attempts.filter((a) => !quizzes.some((q) => String(q._id) === String(a.quizId))).length,
      grades: grades.filter(
        (g) =>
          !evaluations.some((e) => String(e._id) === String(g.evaluationId)) ||
          !has(users, g.userId)
      ).length,
      evaluations: evaluations.filter((e) => !rubrics.some((r) => String(r._id) === String(e.rubricId)))
        .length,
    };
    return { ...count, total: Object.values(count).reduce((s, v) => s + v, 0) };
  },
});

export const cleanupOrphans = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const [lectures, activities, quizzes, users, evaluations] = await Promise.all([
      ctx.db.query("lectures").collect(),
      ctx.db.query("activities").collect(),
      ctx.db.query("quizzes").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("evaluations").collect(),
    ]);
    const has = (rows: any[], id: any) => rows.some((r) => String(r._id) === String(id));
    let deleted = 0;
    const completions = await ctx.db.query("completions").collect();
    for (const c of completions) {
      if (
        (c.lectureId && !has(lectures, c.lectureId)) ||
        (c.activityId && !has(activities, c.activityId)) ||
        !has(users, c.userId)
      ) {
        await ctx.db.delete(c._id);
        deleted++;
      }
    }
    const attempts = await ctx.db.query("attempts").collect();
    const doomedAttempts = new Set<string>();
    for (const a of attempts) {
      if (!quizzes.some((q) => String(q._id) === String(a.quizId)) || !has(users, a.userId)) {
        doomedAttempts.add(String(a._id));
        await ctx.db.delete(a._id);
        deleted++;
      }
    }
    const grades = await ctx.db.query("grades").collect();
    const doomedGrades = new Set<string>();
    for (const g of grades) {
      if (
        !evaluations.some((e) => String(e._id) === String(g.evaluationId)) ||
        !has(users, g.userId)
      ) {
        doomedGrades.add(String(g._id));
        await ctx.db.delete(g._id);
        deleted++;
      }
    }
    const xp = await ctx.db.query("xpEvents").collect();
    for (const e of xp) {
      const orphan =
        !has(users, e.userId) ||
        (e.kind === "lecture" && !has(lectures, e.refId)) ||
        (e.kind === "activity" && !has(activities, e.refId)) ||
        (e.kind === "quiz" && !attempts.some((a) => String(a._id) === e.refId)) ||
        (e.kind === "evaluation" &&
          (doomedGrades.has(e.refId) ||
            (e.refId.startsWith("eval:")
              ? !evaluations.some((ev) => `eval:${String(ev._id)}` === e.refId)
              : !grades.some((g) => String(g._id) === e.refId))));
      if (orphan) {
        await ctx.db.delete(e._id);
        deleted++;
      }
    }
    return { deleted };
  },
});

// Who marked this activity done (for admin observability).
export const activityRoster = query({
  args: { token: v.string(), activityId: v.id("activities") },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const all = await ctx.db.query("completions").collect();
    const mine = all.filter((c) => c.activityId && String(c.activityId) === String(args.activityId));
    const out = [];
    for (const c of mine.sort((a, b) => a.createdAt - b.createdAt)) {
      const u = await ctx.db.get(c.userId);
      if (u) out.push({ username: u.username, displayName: u.displayName, at: c.createdAt });
    }
    return out;
  },
});

// ---------- Activities ----------
export const listActivities = query({
  args: { dayId: v.optional(v.id("days")) },
  handler: async (ctx, args) => {
    if (args.dayId) {
      const rows = await ctx.db
        .query("activities")
        .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
        .collect();
      return rows.sort((a, b) => a.order - b.order);
    }
    const rows = await ctx.db.query("activities").collect();
    return rows.sort((a, b) => a.order - b.order);
  },
});

export const upsertActivity = mutation({
  args: {
    token: v.string(),
    activityId: v.optional(v.id("activities")),
    dayId: v.optional(v.id("days")),
    title: v.string(),
    instructions: v.string(),
    points: v.number(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    if (args.activityId) {
      await ctx.db.patch(args.activityId, {
        dayId: args.dayId,
        title: args.title,
        instructions: args.instructions,
        points: args.points,
        order: args.order,
      });
      return args.activityId;
    }
    return await ctx.db.insert("activities", {
      dayId: args.dayId,
      title: args.title,
      instructions: args.instructions,
      points: args.points,
      order: args.order,
    });
  },
});

export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    return await ctx.storage.generateUploadUrl();
  },
});

export const attachFileToLecture = mutation({
  args: {
    token: v.string(),
    lectureId: v.id("lectures"),
    fileId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    await ctx.db.patch(args.lectureId, {
      fileId: args.fileId,
      fileName: args.fileName,
    });
    return true;
  },
});

export const getFileUrl = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  },
});
