// Generated web-app slide decks: full lecture slides per day.
// Add one entry per dayNo as new decks are authored.

export type DeckSlide = {
  title: string;
  points: string[];
  source?: string;
  diagram?: string;
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
    title: "Day 1 — Welcome to the Craft",
    subtitle: "Expectations, career paths, and the three landmark readings behind this training.",
    slides: [
      {
        title: "Welcome to the craft",
        points: [
          "4 weeks, 20 days: foundations → Java → panels → Solitaire capstone.",
          "Every day: documents to read, activities to submit, quizzes and grades to earn XP.",
          "Today: how training runs, where computing careers lead, and your first readings.",
          "By Oct 30 you will demo a working card game to a panel. Everything points there.",
        ],
      },
      {
        title: "How these 4 weeks run",
        points: [
          "Week 1 — Foundations: SDLC, computers, batch, data, sort and search.",
          "Week 2 — Logic to Java to War Card: flowchart, pseudocode, OOP, then design + code v1.",
          "Week 3 — Panels + deep Java: defend your design, collections, DRY and SOLID, concurrency.",
          "Week 4 — Solitaire capstone: reuse your Card and Deck, build enhanced, final demo.",
        ],
        diagram: `graph LR
  W1["Week 1: Foundations"] --> W2["Week 2: Java + War Card"]
  W2 --> W3["Week 3: Panels + Deep Java"]
  W3 --> W4["Week 4: Solitaire"]`,
      },
      {
        title: "Expectations: how we work",
        points: [
          "Read first, then discuss — lectures assume you've seen the material.",
          "Activities are submitted for grading, not auto-passed: XP = score % × pool.",
          "Quizzes are instant: % correct × pool, +20% for a perfect run.",
          "Panels judge your demos. Ask questions early and often.",
          "Level up: L1 at 0 XP, L2 at 100, L3 at 250, L4 at 500, L5 beyond.",
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
        diagram: `graph TD
  T[Trainee] --> CS["CS: Build systems"]
  T --> IS["Info Science: Organize + Retrieve"]
  T --> SYS["Info Systems: Bridge org + tech"]`,
      },
      {
        title: "Lane 1 — Computer Science: build",
        points: [
          "From Curriculum '68: structures and processes, systems, methodologies.",
          "Roles: systems programmer, language and compiler work, organization and design.",
          "Mindset: algorithms, efficiency, how the machine really behaves.",
          "Proof it matters: every layer you will code in Weeks 2–4 sits on these ideas.",
          "Your mirror: Days 6–10 — logic, Java, OOP, War Card engine.",
        ],
        source: "Curriculum ’68",
      },
      {
        title: "Lane 2 — Information Science: organize and retrieve",
        points: [
          "Salton's lifecycle: produce → analyze → organize → transmit → retrieve.",
          "Three pillars: data structures, multi-user systems, text processing and search.",
          "Modern echo: databases, search engines, knowledge bases, retrieval at scale.",
          "Your mirror: Day 4–5 material — databases, sort and search.",
        ],
        source: "Salton (1969)",
        diagram: `graph LR
  P[Produce] --> A[Analyze] --> O[Organize] --> T[Transmit] --> R[Retrieve]`,
      },
      {
        title: "Lane 3 — Information Systems: bridge org and tech",
        points: [
          "Information Analyst (people and org oriented) vs System Designer (computer oriented).",
          "Leads, DB admins, and planners need both sides at once.",
          "Systems live on 3 levels: operations in seconds, control in weeks, planning in years.",
          "Your mirror: panels, proposals, and the Solitaire capstone.",
        ],
        source: "IS ’72 (Ashenhurst)",
      },
      {
        title: "Reading 1 — Curriculum ’68",
        points: [
          "The first ACM blueprint for CS degrees (Comm. ACM, March 1968).",
          "22 courses from basic (B1–B4) to intermediate (I1–I9) to advanced (A1–A9).",
          "Undergrad major ≈ 30 hours; master's = breadth across divisions + depth + project.",
          "Also covers doctoral guidance, service courses, minors, and continuing education.",
          "Famous detail: B3 discrete structures and I3 computer organization were brand new then.",
        ],
        source: "p151-curriculum 1968.pdf",
      },
      {
        title: "C’68 — the 3 divisions of the field",
        points: [
          "I. Information structures and processes — data, languages, models of computation.",
          "II. Information processing systems — organization, translators, operating systems.",
          "III. Methodologies — numerical math, data processing, graphics, simulation, AI.",
          "Plus the related math and engineering every program leans on.",
          "Mental model: what you compute with, what computes it, and how you apply it.",
        ],
        source: "p151-curriculum 1968.pdf",
        diagram: `graph TD
  CS[Computer Science] --> A["I. Structures and Processes"]
  CS --> B["II. Processing Systems"]
  CS --> C["III. Methodologies"]`,
      },
      {
        title: "C’68 — the course ladder",
        points: [
          "B1 Introduction to Computing: algorithms first, one language done well.",
          "B2, B3, B4: machines and programming, discrete structures, numerical calculus.",
          "Intermediate core: data structures, languages, organization, systems, compilers.",
          "Advanced: graphics, retrieval, AI, computability — pick your depth.",
          "Notice the prerequisite chains: real mastery compounds, it doesn't shortcut.",
        ],
        source: "p151-curriculum 1968.pdf",
      },
      {
        title: "C’68 — making it real",
        points: [
          "Programs need dedicated faculty — about five full-timers to cover the field.",
          "Treat computing as a lab science: real machine access, listings, consoles, labs.",
          "Serve everyone: majors, service courses for other fields, minors, continuing ed.",
          "Batch student jobs then cost ~$30 per semester-hour; machines ran ~$20k a month.",
          "People who graduated even a few years earlier were already out of date — keep learning.",
        ],
        source: "p151-curriculum 1968.pdf",
      },
      {
        title: "Reading 2 — Salton on Information Science",
        points: [
          "A PhD-level map of the field (Comm. ACM, February 1969).",
          "Why it matters to computing people: computers are information-processing devices.",
          "Three parts: structures and languages, multi-user organization, text processing and retrieval.",
          "Proposes 6 graduate courses in 3 year-long sequences, from structures to full systems.",
          "Foreshadows time-sharing utilities and networks of data banks — the cloud, in 1969.",
        ],
        source: "is course 1969.pdf",
      },
      {
        title: "Salton — the 6-course map",
        points: [
          "1. Data structures and information organization — vectors, trees, graphs, search and sort.",
          "2. Time-sharing organization — virtual memory, files, traffic control, scheduling.",
          "3. Language structure — grammars, parsing, syntax and semantics.",
          "4. Text analysis and classification — vectors, clustering, thesaurus ops.",
          "5. Retrieval system design — search strategy, relevance feedback, recall and precision.",
          "6. Full text systems — databases, online retrieval, networks, plus privacy and copyright.",
        ],
        source: "is course 1969.pdf",
      },
      {
        title: "Reading 3 — IS ’72",
        points: [
          "A Master's program for building organizational information systems (1972).",
          "Core claim: great systems need org insight AND tech depth, integrated — not either/or.",
          "A good system is capable, stable, modifiable — and usable, operable, maintainable.",
          "13 courses in 4 groups (org systems, background, technology, development).",
          "Plus 1-year and MBA/CS variants, and notes on coordination, faculty, and materials.",
        ],
        source: "p363-ashenhurst IS 72.pdf",
      },
      {
        title: "IS ’72 — two doors, one career",
        points: [
          "Information Analyst: people-oriented, organization-oriented — needs and flows.",
          "System Designer: computer-oriented — turns requirements into working systems.",
          "Project leaders need both; DB admins, planners, and consultants blend them too.",
          "Entry splits early, leadership merges: promotion to lead demands the combination.",
          "Question for you: which door first? Most great careers walk through both.",
        ],
        source: "p363-ashenhurst IS 72.pdf",
        diagram: `graph LR
  ORG[Organization needs] --> IA[Information Analyst]
  IA --> SD[System Designer]
  SD --> SYS[Working system]`,
      },
      {
        title: "IS ’72 — the development process",
        points: [
          "Analysis → design → implementation → operation — then iterate forever.",
          "Information analysis asks what the org needs; system design builds it.",
          "Balance both: tech-heavy systems ignore people; org-heavy ones never ship.",
          "Analysis and design overlap and interact — the same person often does both.",
          "Graduates prove it with real projects, presentations, and teamwork.",
        ],
        source: "p363-ashenhurst IS 72.pdf",
        diagram: `graph LR
  AN[Analysis] --> DE[Design] --> IM[Implementation] --> OP[Operation]
  OP -.->|iterate| AN`,
      },
      {
        title: "Why these three?",
        points: [
          "1968 asks: what should be taught — the map of the whole field.",
          "1969 goes deep on one specialty — organizing and retrieving knowledge.",
          "1972 bridges to business — turning tech into systems organizations run on.",
          "Together: the full career map. Foundations, depth, impact.",
          "Your 4 weeks replay this arc in miniature — watch for it as we go.",
        ],
        diagram: `graph LR
  Y68["1968: Map the field"] --> Y69["1969: Go deep on retrieval"]
  Y69 --> Y72["1972: Bridge to business"]`,
      },
      {
        title: "Your activity today",
        points: [
          "Read all 3 PDFs (they're on your Day 1 sticky notes).",
          "Write 3 bullets per paper: main idea + one career-path takeaway.",
          "Bring them to discussion — defend your takeaways out loud.",
          "Submit via the activity card. Worth up to 20 XP, graded by your trainer.",
          "Tomorrow we build on this: how software actually gets built.",
        ],
        source: "Activity: Reading reflections",
      },
      {
        title: "Discussion prompts",
        points: [
          "Which of the three lanes fits you today — builder, organizer, or bridger?",
          "Analyst or designer: where are you stronger, and how will you cover the other half?",
          "If Curriculum ’68 were written today, which course would you add first?",
          "Which 1972 idea — usability, maintainability, iteration — matters most for our capstone?",
        ],
        source: "Discussion",
      },
      {
        title: "Tomorrow: SDLC",
        points: [
          "How software actually gets built, end to end.",
          "Requirements → design → build → test → deploy → maintain.",
          "The same life cycle those 1972 analysts formalized — still running the industry.",
          "Come with one example: a system you use daily, and where it could break.",
        ],
        source: "Next: Day 2",
        diagram: `graph LR
  R[Requirements] --> D[Design] --> B[Build] --> T[Test] --> DP[Deploy] --> M[Maintain]`,
      },
    ],
  },
};
