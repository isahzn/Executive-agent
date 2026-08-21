# Phase 2 — Persistent Memory System

## Objective

Build Freebuff's persistent memory architecture.

This phase defines how Freebuff remembers information across sessions, determines what is worth remembering, retrieves relevant memories, updates existing memories, resolves contradictions, and prevents its memory from becoming polluted with temporary or incorrect information.

**Execute only Phase 2.**

Do not begin Phase 3 or any later phase.

---

# 1. Read the Foundation First

Before making changes, read:

```text
Freebuff.md
System/startup.md
System/memory.md
System/security.md
Memory/facts.md
Memory/preferences.md
Memory/decisions.md
Memory/lessons.md
Memory/activity.log
```

Also inspect the current workspace and Phase 1 implementation.

Do not assume the files contain exactly what Phase 1 intended. Work from the actual files.

---

# 2. Core Memory Philosophy

Freebuff must not attempt to remember everything.

The memory system must distinguish between:

1. Temporary context
2. Persistent facts
3. User preferences
4. Architectural/business decisions
5. Lessons learned
6. Project-specific information
7. Historical information
8. Sensitive information
9. Incorrect or obsolete information

The goal is:

> Remember what improves future decisions, not everything that has ever been said.

---

# 3. Memory Hierarchy

Implement this hierarchy:

```text
Current Conversation
        ↓
Freebuff.md
        ↓
Global Memory
        ↓
Project Memory
        ↓
Historical / Archived Memory
```

### Current Conversation

Highest-priority temporary context.

It disappears when the session ends unless something is deliberately persisted.

### Freebuff.md

Permanent operating instructions and fundamental identity.

### Global Memory

Information that applies across multiple projects or future conversations.

### Project Memory

Information specific to one project.

### Historical / Archived Memory

Information that is retained but should not normally influence active decisions.

---

# 4. Memory Categories

Use these primary categories.

## 4.1 Facts

`Memory/facts.md`

Stable factual information that is useful for future work.

Examples:

- established technical facts
- known project relationships
- confirmed infrastructure details
- stable information about the user's workflow

Do not store guesses as facts.

---

## 4.2 Preferences

`Memory/preferences.md`

Long-term preferences that should influence future decisions.

Examples:

- preferred technology
- preferred workflow
- preferred output format
- preferred architecture
- preferred development methodology

A preference should not be created merely because the user made a one-time choice.

---

## 4.3 Decisions

`Memory/decisions.md`

Important decisions that affect future work.

Every meaningful decision should ideally contain:

```text
Decision
Date
Context
Reason
Scope
Status
```

Example:

```text
Decision:
Production applications should use VPS hosting by default.

Reason:
The user wants greater control and predictable hosting costs.

Scope:
Future production applications unless explicitly overridden.

Status:
Active
```

---

## 4.4 Lessons

`Memory/lessons.md`

Things learned from mistakes, failures, experiments, or corrections.

A lesson should describe:

```text
Problem
What happened
Cause
Lesson
Future rule
```

Do not store blame or emotional commentary.

---

# 5. Project Memory

Do not put project-specific information into global memory.

Each project may eventually contain its own memory files.

For example:

```text
Projects/
└── Floza/
    ├── README.md
    ├── architecture.md
    ├── decisions.md
    ├── tasks.md
    └── memory.md
```

The exact project architecture may be expanded in the Project phase.

For now, establish this rule:

> Information that only applies to one project belongs to that project unless it represents a broader reusable preference, lesson, or decision.

---

# 6. Memory Classification

Whenever Freebuff receives new information, it should mentally classify it.

Use:

```text
TEMPORARY
FACT
PREFERENCE
DECISION
LESSON
PROJECT-SPECIFIC
HISTORICAL
UNKNOWN
```

If the classification is `UNKNOWN`, do not automatically save it as permanent memory.

---

# 7. Memory Importance

Assign memory importance conceptually:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

### CRITICAL

Information that can fundamentally change how Freebuff operates.

Examples:

- security requirements
- fundamental user instructions
- major architectural rules

### HIGH

Information that frequently affects decisions.

### MEDIUM

Useful information that may occasionally matter.

### LOW

Minor information that is unlikely to affect future decisions.

Low-value information should normally not become permanent memory.

---

# 8. Memory Confidence

Every persistent memory should have an implicit or explicit confidence level:

```text
CONFIRMED
INFERRED
UNCERTAIN
```

### CONFIRMED

The user explicitly stated it or it was verified.

### INFERRED

Freebuff derived it from repeated behavior or context.

### UNCERTAIN

Freebuff is not confident enough to treat it as fact.

Rules:

> Never represent an inferred or uncertain memory as a confirmed fact.

When uncertain information could materially affect a decision, ask the user.

---

# 9. Explicit Memory Requests

If the user says:

> "Remember this."

Freebuff must treat this as an explicit persistence request.

It should determine the appropriate memory category and save it.

If the user says:

> "Forget this."

Freebuff must remove or invalidate the relevant persistent memory.

Do not merely stop mentioning it.

---

# 10. Automatic Memory

Freebuff should also be capable of identifying information worth remembering without the user explicitly saying "remember."

Potential triggers include:

- repeated preferences
- repeated corrections
- important architectural decisions
- recurring workflows
- reusable lessons
- permanent project conventions
- explicit long-term instructions

However:

> Automatic memory must be conservative.

When in doubt, do not save.

---

# 11. Memory Promotion

Temporary information can be promoted into persistent memory.

For example:

```text
Conversation
    ↓
Temporary observation
    ↓
Repeated / confirmed
    ↓
Persistent memory
```

Freebuff should not promote information simply because it appeared once.

Evidence may include:

- explicit user statement
- repeated user preference
- confirmed correction
- verified project decision
- repeated successful workflow

---

# 12. Memory Demotion

Memory can become obsolete.

For example:

```text
Active preference
       ↓
User changes preference
       ↓
Old memory becomes obsolete
       ↓
Archive / invalidate
```

Do not silently overwrite important historical decisions.

Preserve history where useful.

---

# 13. Contradiction Handling

If Freebuff discovers conflicting memories:

Example:

```text
Memory A:
Use Supabase by default.

Memory B:
Do not use Supabase anymore.
```

Do not arbitrarily choose one.

Instead:

1. Determine which memory is newer.
2. Determine scope.
3. Determine whether one explicitly supersedes the other.
4. Check project-specific context.
5. If ambiguity remains and the decision matters, ask the user.

The newest statement does not automatically override an older statement if the scopes differ.

---

# 14. Scope

Memory must have scope.

Possible scopes:

```text
GLOBAL
PROJECT
TASK
SESSION
```

Example:

```text
GLOBAL:
Use VPS hosting for production by default.

PROJECT:
This specific project uses Vercel.

TASK:
Use Vercel for this particular demo.
```

Never turn a task-level choice into a global preference without evidence.

---

# 15. Memory Retrieval

Freebuff must not blindly load every memory file into every context.

Instead:

```text
User request
     ↓
Determine relevant topic
     ↓
Search relevant memory
     ↓
Retrieve relevant entries
     ↓
Use them as context
```

Examples:

A coding request may need:

```text
preferences
decisions
lessons
relevant project memory
```

A personal/general conversation may need only relevant global memory.

A completely unrelated task should not load unrelated project information.

---

# 16. Memory Priority

When multiple pieces of memory are relevant, prioritize:

```text
Current explicit user instruction
        ↓
Approved task scope
        ↓
Project-specific decisions
        ↓
Global decisions
        ↓
Preferences
        ↓
Facts
        ↓
Lessons
        ↓
Historical information
```

A current explicit instruction can override an older preference.

Example:

If the global preference says:

> Use PostgreSQL.

but the user says:

> For this project, use Supabase.

Freebuff should use Supabase for that project.

Do not rewrite the global preference unless the user establishes a permanent change.

---

# 17. Memory Updates

When updating memory:

1. Search for an existing related memory.
2. Do not create duplicates.
3. Update or supersede existing information where appropriate.
4. Preserve important history.
5. Record the reason for significant changes.
6. Keep entries concise.

Avoid creating dozens of tiny memory entries when one structured entry would be better.

---

# 18. Memory File Structure

Improve the existing files so they are structured and machine-readable.

For example:

```text
Memory/preferences.md

# Preferences

## Active

### Preference: Production Hosting
- Status: Active
- Scope: Global
- Confidence: Confirmed
- Importance: High
- Preference: ...
- Reason: ...
```

Use the same principle for facts, decisions, and lessons.

Do not create unnecessary complexity.

---

# 19. Activity Log

Use:

```text
Memory/activity.log
```

for important memory operations.

Record events such as:

```text
MEMORY_CREATED
MEMORY_UPDATED
MEMORY_SUPERSEDED
MEMORY_ARCHIVED
MEMORY_FORGOTTEN
```

Each significant entry should contain:

```text
Timestamp
Operation
Category
Short description
Reason
```

Do not log every trivial read operation.

---

# 20. Forgetting

Freebuff must support deliberate forgetting.

When the user asks it to forget something:

1. Identify the relevant memory.
2. Verify what should be removed.
3. Remove it from active memory.
4. If historical preservation is appropriate, move it to an archive rather than leaving it active.
5. Ensure the forgotten information is no longer treated as current knowledge.

Do not retain a "secret hidden copy" of information the user explicitly asked Freebuff to forget.

---

# 21. Recycle Bin and Memory

The Recycle Bin must not become an active memory source.

```text
TMP/Recycle-Bin/
```

is for retained discarded material.

Freebuff should not normally retrieve information from it during ordinary tasks.

Only inspect it when:

- the user asks
- recovering something
- debugging history
- investigating why something was removed

---

# 22. Security

Never store:

- API keys
- passwords
- authentication tokens
- private credentials
- private secrets

inside persistent Markdown memory.

If Freebuff encounters credentials, it should use the appropriate secure environment/configuration mechanism instead.

Memory can store:

```text
OPENROUTER_API_KEY exists
```

but never:

```text
OPENROUTER_API_KEY=actual-secret
```

---

# 23. Sensitive Information

Do not unnecessarily persist sensitive personal information.

Only store sensitive information when it is genuinely necessary for the system and appropriate to retain.

The memory system should favor usefulness and minimization.

---

# 24. Memory Quality Rules

Every persistent memory should pass these questions:

```text
Is it useful later?
Is it accurate?
Is its scope clear?
Is it confirmed?
Does it duplicate existing memory?
Could it become obsolete?
Would saving it improve future decisions?
```

If the answer to most of these is no, do not save it.

---

# 25. Memory Search Strategy

When searching memory, use:

1. Exact relevant keywords.
2. Semantic meaning.
3. Related decisions/preferences.
4. Project scope.
5. Recency when appropriate.

Do not assume the filename alone contains the answer.

Search the content.

---

# 26. Memory and Freebuff.md

`Freebuff.md` should contain only fundamental, relatively stable operating principles.

Do not turn it into a database.

Use:

```text
Freebuff.md
    =
Operating Constitution

Memory/
    =
Persistent Knowledge
```

If a memory repeatedly becomes important enough to affect Freebuff's fundamental behavior, it may eventually be promoted into `Freebuff.md`.

That promotion should be deliberate.

---

# 27. Memory Learning Loop

After meaningful tasks, Freebuff should perform:

```text
Task completed
     ↓
What did I learn?
     ↓
Is it reusable?
     ↓
Does it already exist?
     ↓
Is it confirmed?
     ↓
What scope?
     ↓
Save / update / ignore
```

This is the foundation for future self-improvement.

---

# 28. Verification

Before declaring Phase 2 complete, verify:

- [ ] Memory categories are defined.
- [ ] Memory hierarchy is defined.
- [ ] Global and project memory are separated.
- [ ] Temporary context is separated from persistent memory.
- [ ] Memory scope exists.
- [ ] Memory confidence exists.
- [ ] Memory importance exists.
- [ ] Contradiction handling is defined.
- [ ] Memory promotion is defined.
- [ ] Memory demotion is defined.
- [ ] Memory retrieval rules exist.
- [ ] Memory update rules exist.
- [ ] Duplicate prevention exists.
- [ ] Forgetting is supported.
- [ ] Recycle Bin is excluded from normal memory retrieval.
- [ ] Secrets are excluded from persistent memory.
- [ ] Activity logging is established.
- [ ] Memory files are structured.
- [ ] Freebuff.md remains an operating document rather than becoming a database.
- [ ] Phase 3 has NOT been executed.

---

# 29. Phase Completion

Record:

- what was implemented
- important memory architecture decisions
- any problems encountered
- unresolved questions
- anything Phase 3 should know

Update the appropriate memory/decision files only with information that genuinely belongs there.

Do not fabricate information.

---

# 30. STOP CONDITION

When Phase 2 is complete and verified:

**STOP.**

Do not automatically execute Phase 3.

Report:

```text
PHASE 2 COMPLETE

Implemented:
...

Important decisions:
...

Memory architecture:
...

Issues:
...

Next phase:
Phase 3 — Plan Mode & Approval System

Waiting for authorization.
```

Wait for explicit user authorization before continuing.