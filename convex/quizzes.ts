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

// ---------- Quizzes ----------
export const listQuizzes = query({
  args: { dayId: v.optional(v.id("days")) },
  handler: async (ctx, args) => {
    if (args.dayId) {
      return await ctx.db
        .query("quizzes")
        .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
        .collect();
    }
    return await ctx.db.query("quizzes").collect();
  },
});

export const getQuiz = query({
  args: { quizId: v.id("quizzes"), includeAnswers: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return null;
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();
    const sorted = questions.sort((a, b) => a.order - b.order);
    return {
      ...quiz,
      questions: args.includeAnswers
        ? sorted
        : sorted.map((q) => ({
            _id: q._id,
            prompt: q.prompt,
            choices: q.choices,
            points: q.points,
            order: q.order,
          })),
    };
  },
});

export const upsertQuiz = mutation({
  args: {
    token: v.string(),
    quizId: v.optional(v.id("quizzes")),
    dayId: v.optional(v.id("days")),
    title: v.string(),
    description: v.optional(v.string()),
    points: v.number(),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    if (args.quizId) {
      await ctx.db.patch(args.quizId, {
        dayId: args.dayId,
        title: args.title,
        description: args.description,
        points: args.points,
        active: args.active ?? true,
      });
      return args.quizId;
    }
    return await ctx.db.insert("quizzes", {
      dayId: args.dayId,
      title: args.title,
      description: args.description,
      points: args.points,
      active: args.active ?? true,
    });
  },
});

export const upsertQuestion = mutation({
  args: {
    token: v.string(),
    questionId: v.optional(v.id("questions")),
    quizId: v.id("quizzes"),
    prompt: v.string(),
    choices: v.array(v.string()),
    answerIndex: v.number(),
    points: v.number(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    if (args.choices.length < 2) throw new Error("Need at least 2 choices");
    if (args.answerIndex < 0 || args.answerIndex >= args.choices.length)
      throw new Error("Bad answerIndex");
    if (!(args.order >= 1)) throw new Error("Order must be 1 or higher");
    const siblings = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();
    if (
      siblings.some(
        (s) => String(s._id) !== String(args.questionId ?? "") && s.order === args.order
      )
    )
      throw new Error(`Order ${args.order} is already used in this quiz — pick another`);
    if (args.questionId) {
      await ctx.db.patch(args.questionId, {
        quizId: args.quizId,
        prompt: args.prompt,
        choices: args.choices,
        answerIndex: args.answerIndex,
        points: 1, // every question is worth exactly 1 pt; XP scales by quiz pool
        order: args.order,
      });
      return args.questionId;
    }
    return await ctx.db.insert("questions", {
      quizId: args.quizId,
      prompt: args.prompt,
      choices: args.choices,
      answerIndex: args.answerIndex,
      points: 1, // every question is worth exactly 1 pt; XP scales by quiz pool
      order: args.order,
    });
  },
});

export const deleteQuestion = mutation({
  args: { token: v.string(), questionId: v.id("questions") },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    await ctx.db.delete(args.questionId);
    return true;
  },
});

export const deleteQuiz = mutation({
  args: { token: v.string(), quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const qs = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();
    for (const q of qs) await ctx.db.delete(q._id);
    await ctx.db.delete(args.quizId);
    return true;
  },
});

// ---------- Attempts + XP ----------
export const submitQuiz = mutation({
  args: {
    token: v.string(),
    quizId: v.id("quizzes"),
    answers: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz || !quiz.active) throw new Error("Quiz not available");
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();
    const sorted = questions.sort((a, b) => a.order - b.order);
    let score = 0;
    let total = 0;
    let correct = 0;
    sorted.forEach((q, i) => {
      total += q.points;
      if (args.answers[i] === q.answerIndex) {
        score += q.points;
        correct++;
      }
    });
    const count = sorted.length;
    // Anti-farm: retakes only pay the improvement over your previous best.
    const prior = await ctx.db
      .query("attempts")
      .withIndex("by_user_quiz", (q) => q.eq("userId", u._id).eq("quizId", args.quizId))
      .collect();
    const prevBest = prior.reduce((m, a) => Math.max(m, a.score), 0);
    const prevPerfect = prior.some((a) => a.total > 0 && a.score >= a.total);
    const pool = quiz.points > 0 ? quiz.points : 100;
    const attemptId = await ctx.db.insert("attempts", {
      userId: u._id,
      quizId: args.quizId,
      answers: args.answers,
      score,
      total,
      createdAt: Date.now(),
    });
    // XP = percent correct x pool (each question is 1 pt), plus perfect
    // bonus +20% of pool (first perfect only). Retakes pay improvement only.
    const pct = count ? correct / count : 0;
    const prevPct = total && prevBest ? Math.min(1, prevBest / total) : 0;
    const xp =
      Math.max(0, Math.round(pct * pool) - Math.round(prevPct * pool)) +
      (pct === 1 && count > 0 && !prevPerfect ? Math.ceil(pool * 0.2) : 0);
    if (xp > 0) {
      await ctx.db.insert("xpEvents", {
        userId: u._id,
        kind: "quiz",
        refId: attemptId,
        xp,
        createdAt: Date.now(),
      });
    }
    return { score, total, xp };
  },
});

export const myAttempts = query({
  args: { token: v.string(), quizId: v.optional(v.id("quizzes")) },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    if (args.quizId) {
      const rows = await ctx.db
        .query("attempts")
        .withIndex("by_user_quiz", (q) =>
          q.eq("userId", u._id).eq("quizId", args.quizId!)
        )
        .collect();
      return rows.sort((a, b) => b.createdAt - a.createdAt);
    }
    const rows = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", u._id))
      .collect();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const completeLecture = mutation({
  args: { token: v.string(), lectureId: v.id("lectures") },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    const existing = await ctx.db
      .query("completions")
      .withIndex("by_user_lecture", (q) =>
        q.eq("userId", u._id).eq("lectureId", args.lectureId)
      )
      .unique();
    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture) throw new Error("Lecture not found");
    if (!existing) {
      await ctx.db.insert("completions", {
        userId: u._id,
        lectureId: args.lectureId,
        dayId: lecture.dayId,
        createdAt: Date.now(),
      });
      await ctx.db.insert("xpEvents", {
        userId: u._id,
        kind: "lecture",
        refId: args.lectureId,
        xp: 10,
        createdAt: Date.now(),
      });
    }
    return true;
  },
});

export const completeActivity = mutation({
  args: { token: v.string(), activityId: v.id("activities") },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new Error("Activity not found");
    // Submit once — no instant XP. XP comes from the trainer's grade
    // (evaluation linked to this activity): percent x XP pool.
    const existing = await ctx.db
      .query("completions")
      .withIndex("by_user_activity", (q) =>
        q.eq("userId", u._id).eq("activityId", args.activityId)
      )
      .unique();
    if (existing) return { already: true };
    await ctx.db.insert("completions", {
      userId: u._id,
      activityId: args.activityId,
      dayId: activity.dayId,
      createdAt: Date.now(),
    });
    return { already: false };
  },
});

// ---------- Stats / leaderboard ----------
function levelForXp(xp: number) {
  // 0-99 L1, 100-249 L2, 250-499 L3, 500-899 L4, 900+ L5+
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 900) return 4;
  return 5 + Math.floor((xp - 900) / 500);
}

export const myStats = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    const xpRows = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", u._id))
      .collect();
    const xp = xpRows.reduce((s, r) => s + r.xp, 0);
    const completions = await ctx.db
      .query("completions")
      .withIndex("by_user", (q) => q.eq("userId", u._id))
      .collect();
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", u._id))
      .collect();
    const bestByQuiz: Record<string, number> = {};
    for (const a of attempts) {
      const k = String(a.quizId);
      const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
      bestByQuiz[k] = Math.max(bestByQuiz[k] ?? 0, pct);
    }
    return {
      xp,
      level: levelForXp(xp),
      lecturesDone: completions.filter((c) => c.lectureId).length,
      activitiesDone: completions.filter((c) => c.activityId).length,
      quizzesTaken: attempts.length,
      bestByQuiz,
    };
  },
});

export const leaderboard = query({
  args: { token: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await getSessionUser(ctx, args.token);
    const users = await ctx.db.query("users").collect();
    const xpRows = await ctx.db.query("xpEvents").collect();
    const byUser = new Map<string, number>();
    for (const r of xpRows)
      byUser.set(String(r.userId), (byUser.get(String(r.userId)) ?? 0) + r.xp);
    return users
      .filter((u) => u.active && u.role === "trainee")
      .map((u) => ({
        username: u.username,
        displayName: u.displayName,
        xp: byUser.get(String(u._id)) ?? 0,
        level: levelForXp(byUser.get(String(u._id)) ?? 0),
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, args.limit ?? 20);
  },
});

// Which lectures/activities the logged-in user already completed.
export const myCompletions = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    const rows = await ctx.db
      .query("completions")
      .withIndex("by_user", (q) => q.eq("userId", u._id))
      .collect();
    return {
      lectures: rows.filter((r) => r.lectureId).map((r) => String(r.lectureId)),
      activities: rows.filter((r) => r.activityId).map((r) => String(r.activityId)),
    };
  },
});

// Full history for the grade dashboard: XP events + attempts with quiz titles.
export const history = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    const xp = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", u._id))
      .collect();
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", u._id))
      .collect();
    const quizzes = await ctx.db.query("quizzes").collect();
    const titles = new Map(quizzes.map((q) => [String(q._id), q.title]));
    return {
      xp: xp
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((e) => ({ xp: e.xp, kind: e.kind, at: e.createdAt })),
      attempts: attempts
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((a) => ({
          quizTitle: titles.get(String(a.quizId)) ?? "Quiz",
          score: a.score,
          total: a.total,
          at: a.createdAt,
        })),
    };
  },
});
