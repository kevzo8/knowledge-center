# SVI Knowledge Center

4-week training hub (Oct 5–30, 2026): lectures by day + links, activities, quizzes, gamified XP.
Simple auth (same pattern as rf-frozen-system) — admin creates trainee/trainer accounts.

## The 20-day flow (yes, I get you 👍)

- **Week 1 — Foundations (Oct 5–9):** Day 1 intro/expectations/career paths + 3 required PDF readings → Day 2 basic computer → Day 3 batch jobs/processing → Day 4 DB + sort/search → Day 5 SDLC
- **Week 2 — Logic → Java → War Card (Oct 12–16):** pseudocode/flowchart → Java intro/setup → Java fundamentals → OOP → **War Card v1: design + code**
- **Week 3 — Panel + Deep Java (Oct 19–23):** panel/eval 1 on War Card (apply OOP) → collections/exceptions/IO → DRY/SOLID → concurrency → War Card v2 polish
- **Week 4 — Solitaire capstone (Oct 26–30):** Klondike rules reusing Card/Deck → engine → enhanced (undo/scoring/polish) → testing/docs → final panel demo 🎓

## Stack

- Next.js 15 + React 19 + Tailwind 4
- Convex database (no Convex Auth — `users` + `sessions` tables, SHA-256+salt)

## Quick start

```powershell
cd knowledge-center
npm install
npx convex dev        # login, create/link a Convex project, generates convex/_generated
# copy .env.example to .env.local and set NEXT_PUBLIC_CONVEX_URL from convex dev output
npm run dev           # http://localhost:3000
```

## First-time setup (Convex dashboard → Functions)

1. Run `seed:ensureAdmin` with `{ "username": "admin", "password": "changeMe123", "displayName": "Admin" }`
2. Run `seed:seedAll` with `{}` — creates 20 days, ~24 lectures/links, 15 activities, 3 quizzes (12 questions)
3. Log in as admin → `/admin` → create trainer/trainee accounts
4. Upload the 13 files from `C:\Users\kevin.vega\Downloads\knowledge_center`:
   - Convex dashboard → Storage → upload, then paste URL into lecture via Admin
   - In-app upload button is next (backend `content:generateUploadUrl` already ready)

## Source files → days

- `p151-curriculum 1968.pdf`, `is course 1969.pdf`, `p363-ashenhurst IS 72.pdf` → Day 1 (required readings)
- `Basic Computer Concept Material.pptx` → Day 2
- `Batch Job Stream.pptx`, `Batch Processing Examples.pptx` → Day 3
- `Database TIE session.pptx`, `Sort and Search.pptx` → Day 4
- SDLC Google Slides + `System Integration and Software Development Process.pdf` → Day 5
- `Flowcharting.pptx`, `pseudocoding.pptx` → Day 6
- `War_Card_Game_v4.docx` → Day 10 (v1), Day 11 (panel), Day 15 (v2)
- `KLONDIKE Solitaire.doc` → Days 16–20 capstone
- Java / OOP / collections / SOLID / concurrency decks → trainer adds links on Days 7–9, 12–14

## Roles / gamification

- `admin` full, `trainer` content-only, `trainee` learns + earns XP
- Lecture +10 XP, activity +its points, quiz = score + 20% perfect bonus. Levels L1–L5+.
