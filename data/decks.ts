// Generated web-app slide decks: short summaries of each day's documents.
// Add one entry per dayNo as new decks are authored.

export type DeckSlide = {
  title: string;
  points: string[];
  source?: string;
};

export type Deck = {
  dayNo: number;
  title: string;
  subtitle?: string;
  slides: DeckSlide[];
};

export const DECKS: Record<number, Deck> = {
  1: {
    dayNo: 1,
    title: "Day 1 in slides",
    subtitle: "Introductions, expectations, career paths — and what your 3 readings are really about.",
    slides: [
      {
        title: "Welcome to the craft",
        points: [
          "4 weeks, 20 days: foundations → Java → panels → Solitaire capstone.",
          "Every day: lessons to read, activities to submit, quizzes and grades to earn XP.",
          "Today (Day 1): how training runs, where computing careers lead, and your first readings.",
        ],
      },
      {
        title: "Expectations: how we work",
        points: [
          "Read first, then discuss — the lectures assume you've seen the material.",
          "Activities are submitted for grading, not auto-passed: XP = score % × pool.",
          "Quizzes are instant: % correct × pool, +20% for a perfect run.",
          "Panels judge your demos. Ask questions early and often.",
        ],
      },
      {
        title: "Three lanes of computing careers",
        points: [
          "Computer Science — build the machines, languages, and systems.",
          "Information Science — organize knowledge so it can be found and retrieved.",
          "Information Systems — bridge organizations and technology.",
          "Your path here: trainee → developer → designer / lead. Pick a lane — or combine them.",
        ],
      },
      {
        title: "Reading 1 — Curriculum ’68",
        points: [
          "The first ACM blueprint for CS degrees (Comm. ACM, March 1968).",
          "Splits the field into 3 divisions: structures & processes, systems, methodologies.",
          "22 courses from basic (B1–B4) to advanced — undergrad major + master's + doctoral notes.",
          "Takeaway: your training replays this arc in miniature — basics, then systems, then methods.",
        ],
        source: "p151-curriculum 1968.pdf",
      },
      {
        title: "Reading 2 — Salton on Information Science",
        points: [
          "A PhD-level map of information science (Comm. ACM, Feb 1969).",
          "The information lifecycle: produce → analyze → organize → transmit → retrieve.",
          "Three pillars: data structures, multi-user systems, text processing & retrieval.",
          "Takeaway: structures + retrieval are still core — watch for them on your Day 4–5.",
        ],
        source: "is course 1969.pdf",
      },
      {
        title: "Reading 3 — IS ’72 (Ashenhurst)",
        points: [
          "A Master's program for building organizational information systems (1972).",
          "Two career doors: Information Analyst (people/org-oriented) vs System Designer (computer-oriented).",
          "The dev process: analysis → design → implementation → operation.",
          "Takeaway: great careers combine both doors — analysis AND design.",
        ],
        source: "p363-ashenhurst IS 72.pdf",
      },
      {
        title: "Why these three?",
        points: [
          "1968 asks: what should be taught — the map of the whole field.",
          "1969 goes deep on one specialty — organizing and retrieving knowledge.",
          "1972 bridges to business — turning tech into systems organizations run on.",
          "Together: the full career map. 1968 → foundations, 1969 → depth, 1972 → impact.",
        ],
      },
      {
        title: "Your activity today",
        points: [
          "Read all 3 PDFs (they're on your Day 1 sticky notes).",
          "Write 3 bullets per paper: main idea + one career-path takeaway.",
          "Bring them to discussion — defend your takeaways out loud.",
          "Submit via the activity card. Worth up to 20 XP, graded by your trainer.",
        ],
        source: "Activity: Reading reflections",
      },
      {
        title: "Tomorrow: SDLC",
        points: [
          "How software actually gets built, end to end.",
          "Requirements → design → build → test → deploy → maintain.",
          "The same life cycle those 1972 analysts formalized — still running the industry.",
        ],
        source: "Next: Day 2",
      },
    ],
  },
};
