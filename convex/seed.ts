import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Run once from Convex dashboard or via `npx convex run seed:seedAll`
// Seeds the 4-week / 20-day plan starting Mon Oct 5, 2026.
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("days").collect();
    if (existing.length > 0) return { skipped: true, count: existing.length };

    const SDLC_URL =
      "https://docs.google.com/presentation/d/1Eanhhnt7EoSpHL87EBCjSrnmRwEVilyt5L4hg8L9_us/edit?slide=id.g32df004229f_0_11#slide=id.g32df004229f_0_11";
    const KC_URL =
      "https://svicomph.sharepoint.com/sites/KnowledgeCenter2?TeamsCID=68d3d4d4-105a-4d49-ae1d-fff407d4ebaa";

    const days: {
      dayNo: number;
      week: number;
      date: string;
      title: string;
      summary: string;
    }[] = [
      // Week 1 — Foundations
      { dayNo: 1, week: 1, date: "Oct 5 Mon", title: "Day 1 — Introduction, Expectation Setting & Career Paths", summary: "Welcome, how training runs, what 'done' looks like, mainframe/dev career paths. Required reading: the 3 boss-assigned PDFs." },
      { dayNo: 2, week: 1, date: "Oct 6 Tue", title: "Day 2 — SDLC", summary: "System Integration & SDLC process: how software gets built." },
      { dayNo: 3, week: 1, date: "Oct 7 Wed", title: "Day 3 — Basic Computer Concepts", summary: "Hardware/software, files, OS basics from Basic Computer Concept Material.pptx." },
      { dayNo: 4, week: 1, date: "Oct 8 Thu", title: "Day 4 — Batch Jobs & Batch Processing", summary: "Job streams, batch vs online, trace Batch Processing Examples." },
      { dayNo: 5, week: 1, date: "Oct 9 Fri", title: "Day 5 — Databases + Sort & Search", summary: "Database TIE session + Sort and Search deck. Week 1 quiz + retro." },
      // Week 2 — Logic to Java to War Card
      { dayNo: 6, week: 2, date: "Oct 12 Mon", title: "Day 6 — Flowcharting + Pseudocoding", summary: "Think in steps: flowcharts then pseudocode. Foundation for Java." },
      { dayNo: 7, week: 2, date: "Oct 13 Tue", title: "Day 7 — Java Intro & Setup", summary: "JDK, IDE, first program, compile/run, variables & types. (Trainer adds Java deck/link.)" },
      { dayNo: 8, week: 2, date: "Oct 14 Wed", title: "Day 8 — Java Fundamentals", summary: "Control flow, methods, arrays, strings. Lots of live coding." },
      { dayNo: 9, week: 2, date: "Oct 15 Thu", title: "Day 9 — OOP Essentials", summary: "Classes/objects, encapsulation, inheritance, polymorphism — applied to cards (Card, Deck, Player)." },
      { dayNo: 10, week: 2, date: "Oct 16 Fri", title: "Day 10 — War Card Game: design + code v1", summary: "Read War_Card_Game_v4.docx, design classes, code a playable War round. Demo + peer review." },
      // Week 3 — Panel + deeper Java
      { dayNo: 11, week: 3, date: "Oct 19 Mon", title: "Day 11 — Panel / Evaluation 1: War Card demo", summary: "Panel grills War Card v1: apply OOP concepts, defend design decisions. Pass/refactor list." },
      { dayNo: 12, week: 3, date: "Oct 20 Tue", title: "Day 12 — Collections, Exceptions & File I/O", summary: "List/Map/Set, try/catch, reading/writing files — refactor War Card to use them." },
      { dayNo: 13, week: 3, date: "Oct 21 Wed", title: "Day 13 — Clean Code: DRY & SOLID", summary: "DRY, SOLID, small methods, naming. Refactor War Card smells live." },
      { dayNo: 14, week: 3, date: "Oct 22 Thu", title: "Day 14 — Concurrency Basics", summary: "Threads, Runnable, Executor, race conditions — e.g. parallel simulations / timers." },
      { dayNo: 15, week: 3, date: "Oct 23 Fri", title: "Day 15 — War Card v2 polish + quiz", summary: "Apply week-3 concepts to War Card v2. Quiz + retro. Sets up Solitaire capstone." },
      // Week 4 — Solitaire capstone (enhanced from War Card)
      { dayNo: 16, week: 4, date: "Oct 26 Mon", title: "Day 16 — Klondike Solitaire: rules & decomposition", summary: "Read KLONDIKE Solitaire.doc. Break into piles, moves, win condition. Reuse Card/Deck from War." },
      { dayNo: 17, week: 4, date: "Oct 27 Tue", title: "Day 17 — Solitaire build: game state + moves", summary: "Implement tableau/foundation/stock/waste + legal-move engine." },
      { dayNo: 18, week: 4, date: "Oct 28 Wed", title: "Day 18 — Solitaire enhanced: undo, scoring, polish", summary: "Undo, scoring, hints, input validation — the 'enhanced from War Card' output." },
      { dayNo: 19, week: 4, date: "Oct 29 Thu", title: "Day 19 — Testing, edge cases & docs", summary: "Edge cases (empty piles, invalid moves), test plan, README/how-to-play." },
      { dayNo: 20, week: 4, date: "Oct 30 Fri", title: "Day 20 — Final panel, demo & graduation", summary: "Solitaire demo to panel, evaluation, next steps. 🎓" },
    ];

    const dayIds = [];
    for (const d of days) {
      const id = await ctx.db.insert("days", { ...d, active: true });
      dayIds.push(id);
    }
    const [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20] = dayIds;

    const lectures: any[] = [
      // Day 1 readings
      { dayId: d1, title: "Reading 1: p151-curriculum 1968 (required)", kind: "doc", fileName: "p151-curriculum 1968.pdf", notes: "Boss-assigned reading. Upload PDF via Storage, then link here.", order: 1 },
      { dayId: d1, title: "Reading 2: IS course 1969 (required)", kind: "doc", fileName: "is course 1969.pdf", notes: "Boss-assigned reading.", order: 2 },
      { dayId: d1, title: "Reading 3: p363-ashenhurst IS 72 (required)", kind: "doc", fileName: "p363-ashenhurst IS 72.pdf", notes: "Boss-assigned reading.", order: 3 },
      { dayId: d1, title: "Expectation setting & career paths (trainer deck — to add)", kind: "slides", notes: "Add your intro/expectations/career-path slides here.", order: 4 },
      { dayId: d1, title: "Knowledge Center (SharePoint reference)", kind: "link", url: KC_URL, notes: "Old SharePoint.", order: 5 },
      // Day 2 — SDLC
      { dayId: d2, title: "SDLC — System Integration & Software Development Process", kind: "link", url: SDLC_URL, notes: "Master deck. PDF: System Integration and Software Development Process.pdf", order: 1 },
      // Day 3 — computers
      { dayId: d3, title: "Basic Computer Concept Material", kind: "slides", fileName: "Basic Computer Concept Material.pptx", notes: "", order: 1 },
      // Day 4 — batch
      { dayId: d4, title: "Batch Job Stream", kind: "slides", fileName: "Batch Job Stream.pptx", notes: "", order: 1 },
      { dayId: d4, title: "Batch Processing Examples", kind: "slides", fileName: "Batch Processing Examples.pptx", notes: "", order: 2 },
      // Day 5 — DB + sort/search
      { dayId: d5, title: "Database TIE session", kind: "slides", fileName: "Database TIE session.pptx", notes: "", order: 1 },
      { dayId: d5, title: "Sort and Search", kind: "slides", fileName: "Sort and Search.pptx", notes: "", order: 2 },
      // Day 6
      { dayId: d6, title: "Flowcharting", kind: "slides", fileName: "Flowcharting.pptx", notes: "", order: 1 },
      { dayId: d6, title: "Pseudocoding", kind: "slides", fileName: "pseudocoding.pptx", notes: "", order: 2 },
      // Days 7-9 Java placeholders (trainer fills links)
      { dayId: d7, title: "Java intro & setup (trainer link — to add)", kind: "link", notes: "JDK install, IDE setup, Hello World. Paste URL.", order: 1 },
      { dayId: d8, title: "Java fundamentals (trainer link — to add)", kind: "link", notes: "Variables, control flow, methods, arrays.", order: 1 },
      { dayId: d9, title: "OOP essentials (trainer link — to add)", kind: "link", notes: "Classes, encapsulation, inheritance, polymorphism.", order: 1 },
      // Day 10
      { dayId: d10, title: "War Card Game v4 (rules doc)", kind: "doc", fileName: "War_Card_Game_v4.docx", notes: "Design + code v1 reference.", order: 1 },
      // Days 12-14 placeholders
      { dayId: d12, title: "Collections / Exceptions / File I/O (trainer link — to add)", kind: "link", notes: "", order: 1 },
      { dayId: d13, title: "DRY & SOLID / clean code (trainer link — to add)", kind: "link", notes: "", order: 1 },
      { dayId: d14, title: "Concurrency basics (trainer link — to add)", kind: "link", notes: "", order: 1 },
      // Day 16
      { dayId: d16, title: "KLONDIKE Solitaire (rules doc)", kind: "doc", fileName: "KLONDIKE Solitaire.doc", notes: "Capstone reference — enhanced from War Card.", order: 1 },
      // Day 11/15/19/20 need no fixed lecture — panels/demos
      { dayId: d11, title: "Panel 1 briefing (trainer adds rubric)", kind: "link", notes: "Add evaluation rubric link.", order: 1 },
      { dayId: d20, title: "Final panel briefing (trainer adds rubric)", kind: "link", notes: "Add final demo criteria.", order: 1 },
    ];
    for (const l of lectures) await ctx.db.insert("lectures", l);

    const activities = [
      { dayId: d1, title: "Activity: Reading reflections (3 PDFs)", instructions: "Read the 3 required PDFs. Write 3 bullets each: main idea + one career-path takeaway. Discuss Day 1. (+20 XP)", points: 20, order: 1 },
      { dayId: d3, title: "Activity: Trace a batch job stream", instructions: "From Batch Processing Examples, list jobs in order + each step's output. (+20 XP)", points: 20, order: 1 },
      { dayId: d6, title: "Activity: Flowchart → pseudocode", instructions: "Draw a flow (login/ATM), then convert to IF/ELSE + LOOP pseudocode. (+20 XP)", points: 20, order: 1 },
      { dayId: d8, title: "Activity: Java drills", instructions: "FizzBuzz, reverse string, simple menu with methods. Trainer checks in class. (+20 XP)", points: 20, order: 1 },
      { dayId: d9, title: "Activity: Model Card/Deck/Player in OOP", instructions: "Classes with encapsulation; Deck shuffles/deals; Player holds hand. (+20 XP)", points: 20, order: 1 },
      { dayId: d10, title: "Activity: War Card v1 — design + code", instructions: "Per War_Card_Game_v4.docx: class diagram, then playable War incl. tie (WAR!) handling. Demo. (+40 XP)", points: 40, order: 1 },
      { dayId: d12, title: "Activity: Refactor War with collections/exceptions", instructions: "Replace arrays with List/Map where sensible; add input validation + try/catch. (+20 XP)", points: 20, order: 1 },
      { dayId: d13, title: "Activity: DRY/SOLID refactor of War", instructions: "Pick one smell (long method, duplication, leaky class) and refactor. Before/after diff. (+20 XP)", points: 20, order: 1 },
      { dayId: d14, title: "Activity: Concurrency mini-lab", instructions: "Run parallel game simulations with Executor; observe/record race without proper sync. (+20 XP)", points: 20, order: 1 },
      { dayId: d15, title: "Activity: War Card v2 polish", instructions: "Apply weeks 2–3 feedback. Must run clean + be demo-ready. (+30 XP)", points: 30, order: 1 },
      { dayId: d16, title: "Activity: Solitaire decomposition", instructions: "From KLONDIKE doc: list piles, legal moves, win condition. Map reuse from War Card classes. (+20 XP)", points: 20, order: 1 },
      { dayId: d17, title: "Activity: Solitaire engine", instructions: "Implement game state + move validation. Playable in console min. (+40 XP)", points: 40, order: 1 },
      { dayId: d18, title: "Activity: Solitaire enhanced", instructions: "Add undo, scoring, hints/polish — the 'enhanced from War Card' output. (+40 XP)", points: 40, order: 1 },
      { dayId: d19, title: "Activity: Test plan + README", instructions: "Edge cases (empty piles, invalid moves), test log, how-to-play README. (+20 XP)", points: 20, order: 1 },
      { dayId: d20, title: "Activity: Final demo", instructions: "Live Solitaire demo to panel + Q&A. (+30 XP)", points: 30, order: 1 },
    ];
    for (const a of activities) await ctx.db.insert("activities", a);

    // Quizzes: week 1 logic check, Java/OOP check, final
    const q1 = await ctx.db.insert("quizzes", { dayId: d5, title: "Quiz: Week 1 foundations", description: "SDLC, computers, batch, DB, sort/search.", points: 100, active: true });
    for (const q of [
      { prompt: "In SDLC, what typically follows Requirements gathering?", choices: ["Deployment", "Design", "Maintenance", "Retirement"], answerIndex: 1, points: 25, order: 1 },
      { prompt: "Batch processing means…", choices: ["Instant per-transaction", "Jobs grouped, run without user interaction", "Only sorting", "Card batches"], answerIndex: 1, points: 25, order: 2 },
      { prompt: "Which shape is a DECISION in a flowchart?", choices: ["Rectangle", "Diamond", "Oval", "Parallelogram"], answerIndex: 1, points: 25, order: 3 },
      { prompt: "Pseudocode is…", choices: ["Runnable mainframe code", "Plain-language steps before coding", "A flowchart shape", "A DB query"], answerIndex: 1, points: 25, order: 4 },
    ])
      await ctx.db.insert("questions", { quizId: q1, ...q });

    const q2 = await ctx.db.insert("quizzes", { dayId: d15, title: "Quiz: Java + OOP + clean code", description: "Covers days 7–14. Trainer expands.", points: 100, active: true });
    for (const q of [
      { prompt: "Encapsulation mainly means…", choices: ["Hiding internals, exposing behavior", "Copying code", "Running threads", "Sorting fast"], answerIndex: 0, points: 25, order: 1 },
      { prompt: "DRY stands for…", choices: ["Do Repeat Yourself", "Don't Repeat Yourself", "Data Runs Yearly", "Deploy, Run, Yield"], answerIndex: 1, points: 25, order: 2 },
      { prompt: "A race condition happens when…", choices: ["Two threads access shared state unsafely", "Code runs too slowly", "Deck has 52 cards", "Quiz has 4 options"], answerIndex: 0, points: 25, order: 3 },
      { prompt: "SOLID's 'S' is…", choices: ["Single Responsibility", "Super Inheritance", "Static Data", "Synchronized"], answerIndex: 0, points: 25, order: 4 },
    ])
      await ctx.db.insert("questions", { quizId: q2, ...q });

    const q3 = await ctx.db.insert("quizzes", { dayId: d19, title: "Quiz: Solitaire readiness", description: "Rules + edge cases before final panel.", points: 100, active: true });
    for (const q of [
      { prompt: "Klondike foundation piles build by…", choices: ["Suit, Ace→King", "Alternating colors down", "Any order", "Random"], answerIndex: 0, points: 25, order: 1 },
      { prompt: "Tableau builds by…", choices: ["Suit up", "Alternating color descending", "Same color", "Pairs"], answerIndex: 1, points: 25, order: 2 },
      { prompt: "Good edge case to test?", choices: ["Empty stock + empty waste", "Only happy path", "No shuffling ever", "Skipping README"], answerIndex: 0, points: 25, order: 3 },
      { prompt: "Best reuse from War Card?", choices: ["Card/Deck/shuffle + game loop discipline", "Nothing", "Hardcoded values", "Copy-paste all"], answerIndex: 0, points: 25, order: 4 },
    ])
      await ctx.db.insert("questions", { quizId: q3, ...q });

    return { skipped: false, days: dayIds.length };
  },
});

// One-time fix: actual conducted order was Day 2 = SDLC, Day 3 = computers,
// Day 4 = batch, Day 5 = DB + sort/search. Moves week-1 lectures to the
// right days and renames the day titles. Safe to run once (idempotent guard).
export const fixWeek1Order = mutation({
  args: {},
  handler: async (ctx) => {
    const days = await ctx.db.query("days").collect();
    const byNo = new Map(days.map((d) => [d.dayNo, d]));
    const d2 = byNo.get(2);
    const d3 = byNo.get(3);
    const d4 = byNo.get(4);
    const d5 = byNo.get(5);
    if (!d2 || !d3 || !d4 || !d5) throw new Error("Week 1 days missing");
    if (d2.title.includes("SDLC")) return { alreadyFixed: true };

    // Lecture sets move with the topic: old dayNo -> new dayNo
    const moves: Record<number, typeof d2> = { 2: d3, 3: d4, 4: d5, 5: d2 };
    const newIds: Record<number, typeof d2._id> = {
      2: d2._id,
      3: d3._id,
      4: d4._id,
      5: d5._id,
    };
    const lectures = await ctx.db.query("lectures").collect();
    let moved = 0;
    for (const l of lectures) {
      const owner = days.find((d) => d._id === l.dayId);
      if (!owner || owner.dayNo < 2 || owner.dayNo > 5) continue;
      // Don't move the SharePoint reference off Day 1... (it's on d1, untouched)
      await ctx.db.patch(l._id, { dayId: newIds[moves[owner.dayNo].dayNo] });
      moved++;
    }

    const titles: Record<number, { title: string; summary: string }> = {
      2: { title: "Day 2 — SDLC", summary: "System Integration & SDLC process: how software gets built." },
      3: { title: "Day 3 — Basic Computer Concepts", summary: "Hardware/software, files, OS basics from Basic Computer Concept Material.pptx." },
      4: { title: "Day 4 — Batch Jobs & Batch Processing", summary: "Job streams, batch vs online, trace Batch Processing Examples." },
      5: { title: "Day 5 — Databases + Sort & Search", summary: "Database TIE session + Sort and Search deck. Week 1 quiz + retro." },
    };
    for (const [no, t] of Object.entries(titles)) {
      const d = byNo.get(Number(no))!;
      await ctx.db.patch(d._id, { title: t.title, summary: t.summary });
    }
    // Week-1 quiz stays on the last day of the week (dayNo 5) — no move needed.
    return { alreadyFixed: false, moved };
  },
});

// Seeds the panel judging sheets from the old batch + their evaluations.
// Idempotent: skips if rubrics already exist.
export const seedGrading = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("rubrics").collect();
    if (existing.length > 0) return { skipped: true };
    const days = await ctx.db.query("days").collect();
    const dayId = (n: number) => days.find((d) => d.dayNo === n)?._id;

    const warRubric = await ctx.db.insert("rubrics", {
      title: "War Card & Solitaire Panel Sheet",
      description: "Criteria for Judging — panels fill this per trainee.",
      items: [
        { category: "Logic & Execution", criterion: "Sound program logic and efficient algorithms", maxScore: 10 },
        { category: "Logic & Execution", criterion: "Correct implementation and execution of required functionality", maxScore: 10 },
        { category: "Coding Standard Practices", criterion: "Code is readable and easy to understand", maxScore: 10 },
        { category: "Coding Standard Practices", criterion: "Properly modularized into reusable components", maxScore: 10 },
        { category: "Coding Standard Practices", criterion: "Follows coding standards and best practices", maxScore: 10 },
        { category: "Object-Oriented Programming (OOP)", criterion: "Applies Encapsulation effectively", maxScore: 10 },
        { category: "Object-Oriented Programming (OOP)", criterion: "Applies Abstraction effectively", maxScore: 15 },
        { category: "Object-Oriented Programming (OOP)", criterion: "Applies Inheritance & Polymorphism effectively", maxScore: 15 },
        { category: "Presentation", criterion: "Explains implementation, demos app, communicates professionally", maxScore: 10 },
      ],
      active: true,
    });

    const proposalRubric = await ctx.db.insert("rubrics", {
      title: "Project Proposal Sheet",
      description: "Criteria for Judging for project proposals.",
      items: [
        { category: "Problem Definition & Solution", criterion: "Clearly defines the problem with an effective, well-justified solution", maxScore: 30 },
        { category: "Features & Requirements", criterion: "Features complete, relevant, aligned with objectives", maxScore: 30 },
        { category: "Feasibility & Project Planning", criterion: "Realistic scope, approach, timeline, and feasibility", maxScore: 20 },
        { category: "Presentation & Documentation", criterion: "Organized, professional document and presentation", maxScore: 20 },
      ],
      active: true,
    });

    await ctx.db.insert("evaluations", {
      title: "Panel 1: War Card demo",
      description: "Day 11 panel — demo War Card v1, defend OOP design decisions.",
      dayId: dayId(11),
      rubricId: warRubric,
      points: 100,
      active: true,
    });
    await ctx.db.insert("evaluations", {
      title: "Final Panel: Solitaire demo",
      description: "Day 20 panel — demo enhanced Solitaire + Q&A.",
      dayId: dayId(20),
      rubricId: warRubric,
      points: 100,
      active: true,
    });
    await ctx.db.insert("evaluations", {
      title: "Project Proposal defense",
      description: "Standalone proposal presentation grading.",
      rubricId: proposalRubric,
      points: 100,
      active: true,
    });
    return { skipped: false };
  },
});

// One-time cleanup: keep only the earliest completion per (user, activity)
// and remove the duplicate XP event for each dropped row.
export const dedupeCompletions = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("completions").collect();
    const seen = new Set<string>();
    let removedCompletions = 0;
    let removedXp = 0;
    const sorted = [...all].sort((a, b) => a.createdAt - b.createdAt);
    for (const c of sorted) {
      if (!c.activityId) continue;
      const k = `${c.userId}:${c.activityId}`;
      if (!seen.has(k)) {
        seen.add(k);
        continue;
      }
      await ctx.db.delete(c._id);
      removedCompletions++;
      const evts = await ctx.db
        .query("xpEvents")
        .withIndex("by_user", (q) => q.eq("userId", c.userId))
        .collect();
      const match = evts
        .filter((e) => e.kind === "activity" && e.refId === String(c.activityId))
        .sort((a, b) => b.createdAt - a.createdAt)[0];
      if (match) {
        removedXp += match.xp;
        await ctx.db.delete(match._id);
      }
    }
    return { removedCompletions, removedXp };
  },
});

export const ensureAdmin = mutation({
  args: { username: v.string(), password: v.string(), displayName: v.string() },
  handler: async (ctx, args) => {
    const uname = args.username.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", uname))
      .unique();
    const all = await ctx.db.query("users").collect();
    if (all.some((u) => u.role === "admin")) throw new Error("Admin already exists");
    if (existing) throw new Error("Username exists");
    const salt = crypto.randomUUID().slice(0, 16);
    const data = new TextEncoder().encode(`${salt}:${args.password}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const hex = [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    await ctx.db.insert("users", {
      username: uname,
      passwordHash: `$simple$${salt}$${hex}`,
      role: "admin",
      displayName: args.displayName,
      active: true,
    });
    return true;
  },
});
