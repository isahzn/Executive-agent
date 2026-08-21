# System / Memory

## Purpose

Defines how Freebuff manages persistent memory across sessions.

---

## Memory Hierarchy

```text
Current Conversation → Freebuff.md → Global Memory → Project Memory → Archived
```

---

## Memory Categories

| Category | File | Purpose |
|----------|------|---------|
| Facts | `Memory/facts.md` | Stable verified information |
| Preferences | `Memory/preferences.md` | Long-term user preferences |
| Decisions | `Memory/decisions.md` | Important decisions |
| Lessons | `Memory/lessons.md` | Lessons from mistakes |
| Activity | `Memory/activity.log` | Significant operation log |

---

## Memory Scopes

| Scope | Description |
|-------|-------------|
| **Global** | Applies across all projects |
| **Project: [name]** | Applies to one project only |
| **Task: [name]** | Applies to one task only |

---

## Memory Metadata

Every persistent memory entry has:
- **Status**: Active or Archived
- **Scope**: Global, Project, or Task
- **Confidence**: Confirmed, Inferred, or Uncertain
- **Importance**: Critical, High, Medium, Low

---

## Key Rules

- Record facts, not guesses.
- Be concise.
- Do not duplicate existing memory.
- Update existing entries rather than creating new ones.
- Preserve important history.
- Current explicit user instructions override older preferences.
- Automatic memory is conservative — when in doubt, do not save.
- Never store secrets in memory files.

---

## Project Memory

Project-specific knowledge should remain associated with the project:
- Project decisions → `Memory/decisions.md` with Project scope, or in `Projects/[name]/`
- Project facts → `Memory/facts.md` with Project scope
- Project preferences → `Memory/preferences.md` with Project scope

Do not automatically turn every project-specific fact into global knowledge. Promote to global only when genuinely reusable across projects.

---

## Memory Classification

When receiving new information, classify: TEMPORARY, FACT, PREFERENCE, DECISION, LESSON, PROJECT-SPECIFIC, HISTORICAL, UNKNOWN. If UNKNOWN, do not automatically save.

---

## Promotion

Temporary information can be promoted to persistent memory when: user explicitly states it, user repeats a preference, a correction is confirmed, or a project decision is verified. Do not promote from a single occurrence.

Cross-project knowledge promotion: if a project produces genuinely reusable knowledge, the Executive Agent evaluates whether to promote it to global memory or a skill.

---

## Demotion

When a preference or decision changes, archive the old version. Do not silently overwrite.

---

## Contradiction Handling

When conflicting memories are discovered: determine which is newer, check scope (global vs project), check if one supersedes the other, check project context. If ambiguous and the decision matters, ask the user.

---

## Memory Retrieval

Do not blindly load all memory. Retrieve relevant entries based on the current topic, task, and project.

Priority: Current user instruction > Task scope > Project decisions > Global decisions > Preferences > Facts > Lessons > Historical.

---

## Agent Memory

Agents can provide information that may be useful for memory, but the Executive Agent controls persistence. Agents must not maintain independent hidden memories.

---

## Forgetting

When the user asks to forget something: identify the memory, verify what should be removed, remove it from active memory, archive if appropriate. Do not retain a hidden copy.

---

## Security

Never store API keys, passwords, tokens, or secrets in memory files. Credentials live in `.env` and are referenced by name only.

---

## Activity Logging

Log significant operations to `Memory/activity.log`: MEMORY_CREATED, MEMORY_UPDATED, MEMORY_SUPERSEDED, MEMORY_ARCHIVED, MEMORY_FORGOTTEN, TASK_COMPLETED, PHASE_COMPLETED.
