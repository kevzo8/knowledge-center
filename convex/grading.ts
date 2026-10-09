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

function levelForXp(xp: number) {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 900) return 4;
  return 5 + Math.floor((xp - 900) / 500);
}

const itemValidator = v.object({
  category: v.string(),
  criterion: v.string(),
  maxScore: v.number(),
});

// ---------- Rubrics ----------
export const listRubrics = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    return await ctx.db.query("rubrics").collect();
  },
});

export const upsertRubric = mutation({
  args: {
    token: v.string(),
    rubricId: v.optional(v.id("rubrics")),
    title: v.string(),
    description: v.optional(v.string()),
    items: v.array(itemValidator),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    if (args.items.length === 0) throw new Error("Rubric needs at least 1 criterion");
    for (const it of args.items) {
      if (!it.category.trim() || !it.criterion.trim()) throw new Error("Category + criterion required");
      if (!(it.maxScore > 0)) throw new Error("maxScore must be > 0");
    }
    if (args.rubricId) {
      await ctx.db.patch(args.rubricId, {
        title: args.title,
        description: args.description,
        items: args.items,
        active: args.active ?? true,
      });
      return args.rubricId;
    }
    return await ctx.db.insert("rubrics", {
      title: args.title,
      description: args.description,
      items: args.items,
      active: args.active ?? true,
    });
  },
});

// ---------- Evaluations ----------
export const listEvaluations = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const evals = await ctx.db.query("evaluations").collect();
    const out = [];
    for (const e of evals) {
      const grades = await ctx.db
        .query("grades")
        .withIndex("by_evaluation", (q) => q.eq("evaluationId", e._id))
        .collect();
      out.push({ ...e, gradedCount: grades.length });
    }
    return out;
  },
});

export const upsertEvaluation = mutation({
  args: {
    token: v.string(),
    evaluationId: v.optional(v.id("evaluations")),
    title: v.string(),
    description: v.optional(v.string()),
    dayId: v.optional(v.id("days")),
    activityId: v.optional(v.id("activities")),
    rubricId: v.id("rubrics"),
    points: v.number(),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const rubric = await ctx.db.get(args.rubricId);
    if (!rubric) throw new Error("Rubric not found");
    if (!(args.points > 0)) throw new Error("points must be > 0");
    if (args.evaluationId) {
      await ctx.db.patch(args.evaluationId, {
        title: args.title,
        description: args.description,
        dayId: args.dayId,
        activityId: args.activityId,
        rubricId: args.rubricId,
        points: args.points,
        active: args.active ?? true,
      });
      return args.evaluationId;
    }
    return await ctx.db.insert("evaluations", {
      title: args.title,
      description: args.description,
      dayId: args.dayId,
      activityId: args.activityId,
      rubricId: args.rubricId,
      points: args.points,
      active: args.active ?? true,
    });
  },
});

// ---------- Grading ----------
export const gradesForEvaluation = query({
  args: { token: v.string(), evaluationId: v.id("evaluations") },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const evaluation = await ctx.db.get(args.evaluationId);
    if (!evaluation) throw new Error("Evaluation not found");
    const rubric = await ctx.db.get(evaluation.rubricId);
    const trainees = (await ctx.db.query("users").collect()).filter(
      (u) => u.active && u.role === "trainee"
    );
    const grades = await ctx.db
      .query("grades")
      .withIndex("by_evaluation", (q) => q.eq("evaluationId", args.evaluationId))
      .collect();
    const byUser = new Map(grades.map((g) => [String(g.userId), g]));
    return {
      evaluation,
      rubric,
      rows: trainees
        .map((t) => {
          const g = byUser.get(String(t._id));
          return {
            username: t.username,
            displayName: t.displayName,
            grade: g
              ? { scores: g.scores, percent: g.percent, gradedBy: g.gradedBy, at: g.createdAt }
              : null,
          };
        })
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    };
  },
});

export const gradeTrainee = mutation({
  args: {
    token: v.string(),
    evaluationId: v.id("evaluations"),
    username: v.string(),
    scores: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const staff = await requireStaff(ctx, args.token);
    const evaluation = await ctx.db.get(args.evaluationId);
    if (!evaluation || !evaluation.active) throw new Error("Evaluation not available");
    const rubric = await ctx.db.get(evaluation.rubricId);
    if (!rubric) throw new Error("Rubric not found");
    if (args.scores.length !== rubric.items.length)
      throw new Error(`Need ${rubric.items.length} scores`);
    let earned = 0;
    let max = 0;
    rubric.items.forEach((it, i) => {
      const s = args.scores[i];
      if (!(s >= 0) || s > it.maxScore)
        throw new Error(`"${it.criterion}": score must be 0–${it.maxScore}`);
      earned += s;
      max += it.maxScore;
    });
    const percent = max ? Math.round((earned / max) * 100) : 0;
    const trainee = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username.trim().toLowerCase()))
      .unique();
    if (!trainee || !trainee.active) throw new Error("Trainee not found");

    const existing = await ctx.db
      .query("grades")
      .withIndex("by_eval_user", (q) =>
        q.eq("evaluationId", args.evaluationId).eq("userId", trainee._id)
      )
      .unique();
    const gradeId = existing
      ? (await ctx.db.patch(existing._id, {
          scores: args.scores,
          percent,
          gradedBy: staff.username,
          createdAt: Date.now(),
        }), existing._id)
      : await ctx.db.insert("grades", {
          evaluationId: args.evaluationId,
          userId: trainee._id,
          scores: args.scores,
          percent,
          gradedBy: staff.username,
          createdAt: Date.now(),
        });

    // Replace any prior evaluation XP for this grade (re-grades don't double-pay).
    const oldXp = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", trainee._id))
      .collect();
    for (const e of oldXp) {
      if (e.kind === "evaluation" && e.refId === String(gradeId)) await ctx.db.delete(e._id);
    }
    const xp = Math.round((percent * evaluation.points) / 100);
    if (xp > 0) {
      await ctx.db.insert("xpEvents", {
        userId: trainee._id,
        kind: "evaluation",
        refId: String(gradeId),
        xp,
        createdAt: Date.now(),
      });
    }
    return { percent, earned, max, xp };
  },
});

// ---------- Overview: every trainee, broken down by category ----------
export const traineeOverview = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.token);
    const users = (await ctx.db.query("users").collect()).filter(
      (u) => u.active && u.role === "trainee"
    );
    const rows = [];
    for (const u of users) {
      const xpRows = await ctx.db
        .query("xpEvents")
        .withIndex("by_user", (q) => q.eq("userId", u._id))
        .collect();
      const sum = (k: string) => xpRows.filter((r) => r.kind === k).reduce((s, r) => s + r.xp, 0);
      const lectureXp = sum("lecture");
      const quizXp = sum("quiz");
      const activityXp = sum("activity");
      const evalXp = sum("evaluation");
      const totalXp = lectureXp + quizXp + activityXp + evalXp + sum("bonus");

      const completions = await ctx.db
        .query("completions")
        .withIndex("by_user", (q) => q.eq("userId", u._id))
        .collect();
      const attempts = await ctx.db
        .query("attempts")
        .withIndex("by_user", (q) => q.eq("userId", u._id))
        .collect();
      const best: Record<string, number> = {};
      for (const a of attempts) {
        const k = String(a.quizId);
        const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
        best[k] = Math.max(best[k] ?? 0, pct);
      }
      const quizAvgs = Object.values(best);
      const quizAvg = quizAvgs.length ? Math.round(quizAvgs.reduce((s, v) => s + v, 0) / quizAvgs.length) : null;

      const grades = await ctx.db
        .query("grades")
        .withIndex("by_user", (q) => q.eq("userId", u._id))
        .collect();
      const evalAvg = grades.length ? Math.round(grades.reduce((s, g) => s + g.percent, 0) / grades.length) : null;

      rows.push({
        username: u.username,
        displayName: u.displayName,
        level: levelForXp(totalXp),
        totalXp,
        lectureXp,
        lecturesDone: completions.filter((c) => c.lectureId).length,
        quizXp,
        quizAvg,
        quizzesTaken: attempts.length,
        activityXp,
        activitiesDone: completions.filter((c) => c.activityId).length,
        evalXp,
        evalAvg,
        evalsGraded: grades.length,
      });
    }
    const sorted = rows.sort((a, b) => b.totalXp - a.totalXp);

    // Cohort trend per evaluation (for the trend-line chart).
    const evaluations = (await ctx.db.query("evaluations").collect()).filter((e) => e.active);
    const allGrades = await ctx.db.query("grades").collect();
    const panels = evaluations.map((e) => {
      const gs = allGrades.filter((g) => String(g.evaluationId) === String(e._id));
      return {
        evaluationId: String(e._id),
        title: e.title,
        graded: gs.length,
        avg: gs.length ? Math.round(gs.reduce((s, g) => s + g.percent, 0) / gs.length) : null,
      };
    });
    return { rows: sorted, panels };
  },
});

// ---------- Trainee: my own panel grades ----------
export const myGrades = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const u = await getSessionUser(ctx, args.token);
    const grades = await ctx.db
      .query("grades")
      .withIndex("by_user", (q) => q.eq("userId", u._id))
      .collect();
    const out = [];
    for (const g of grades.sort((a, b) => b.createdAt - a.createdAt)) {
      const evaluation = await ctx.db.get(g.evaluationId);
      const rubric = evaluation ? await ctx.db.get(evaluation.rubricId) : null;
      out.push({
        evaluationTitle: evaluation?.title ?? "Evaluation",
        points: evaluation?.points ?? 0,
        percent: g.percent,
        gradedBy: g.gradedBy,
        at: g.createdAt,
        items: (rubric?.items ?? []).map((it, i) => ({ ...it, score: g.scores[i] ?? 0 })),
      });
    }
    return out;
  },
});
