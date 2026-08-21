# System / Startup

## Purpose

Defines the procedure Freebuff follows when a session begins.

---

## Startup Procedure

1. Load Identity — Read `Freebuff.md` to restore identity, principles, and operating states.
2. Determine Current Phase — Scan `TMP/Phases/` to find the active phase.
3. Load Memory — Retrieve relevant memory files (facts, preferences, decisions, lessons). Do not blindly load everything.
4. Check Active Tasks — Read `Tasks/active.md` for in-progress items.
5. Check for Pending Work — Review `Memory/activity.log` for recent activity.
6. Project Discovery — Read `Projects/INDEX.md` to identify relevant projects. Do NOT read all project files.
7. Skill & Agent Discovery (Deferred) — Do NOT load skills or agents at startup. Load lazily when a task is identified.
8. Determine Operating State:
   - If a task is identified → Enter PLAN, discover relevant project, agents, and skills.
   - If no task → Enter WAIT.
9. Await user input.

**Never automatically enter EXECUTE merely because a task was found in memory.** Re-enter PLAN and re-evaluate first.

**Never automatically read all project files.** Load only what is relevant.

---

## Project Context Loading

```text
Projects/INDEX.md (discovery)
    ↓
Relevant PROJECT.md (identity)
    ↓
Relevant project files (only when task requires)
```

---

## Notes

- Never skip steps.
- Never jump phases.
- If a memory file is missing, note it and continue.
- If the current phase cannot be determined, ask the user.
- Skills and agents are loaded lazily — only when needed.
- Project context is loaded progressively — not all at once.
