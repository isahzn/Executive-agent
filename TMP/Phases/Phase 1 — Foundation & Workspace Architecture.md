# Phase 1 — Foundation & Workspace Architecture

## Objective

Build the foundational architecture for the Freebuff Executive Agent.

This is Phase 1 of a multi-phase implementation.

**Do not begin Phase 2 or any later phase.**

The project will contain a `TMP/Phases/` directory containing sequential phase instructions. Execute exactly one phase at a time. After completing this phase, stop and wait for the user to explicitly instruct you to continue.

---

# 1. First: Understand the Existing Workspace

Before changing anything:

1. Inspect the current workspace.
2. Identify the existing project structure.
3. Identify the programming language, framework, package manager, runtime, and existing configuration.
4. Identify any existing Freebuff-related files.
5. Do not delete or overwrite existing work without understanding what it is.
6. Preserve anything that may be useful.

If something important is unclear, ask the user before making a destructive decision.

Do not assume the workspace is empty.

---

# 2. Establish the Freebuff Directory Architecture

Create or adapt the workspace toward this architecture:

```text
FREEBUFF/
│
├── Freebuff.md
├── .env
├── .env.example
├── .gitignore
│
├── System/
│   ├── startup.md
│   ├── execution.md
│   ├── planning.md
│   ├── memory.md
│   ├── security.md
│   └── tool-rules.md
│
├── Memory/
│   ├── facts.md
│   ├── preferences.md
│   ├── decisions.md
│   ├── lessons.md
│   └── activity.log
│
├── Skills/
│
├── Agents/
│
├── Projects/
│
├── Tasks/
│   ├── active.md
│   ├── backlog.md
│   └── completed.md
│
├── Tools/
│
└── TMP/
    ├── Phases/
    └── Recycle-Bin/
```

Adapt this structure if the existing project requires a different implementation, but preserve the conceptual separation.

---

# 3. Create the Phase System

The `TMP/Phases/` directory will contain the complete Freebuff development roadmap.

Each phase must be a separate Markdown file:

```text
TMP/
└── Phases/
    ├── Phase-1.md
    ├── Phase-2.md
    ├── Phase-3.md
    ├── Phase-4.md
    ├── Phase-5.md
    ├── Phase-6.md
    ├── Phase-7.md
    ├── Phase-8.md
    ├── Phase-9.md
    ├── Phase-10.md
    └── ...
```

Phase 1 is the only phase being executed now.

If the later phase files already exist, do not modify their implementation instructions unless necessary.

If they do not exist yet, create placeholder phase files only if the user has already provided enough information to define them accurately.

Do not prematurely implement future phases.

---

# 4. Sequential Phase Rule

Freebuff must understand this rule:

> The phase files are an ordered implementation roadmap. Only the current phase may be executed. Future phases are instructions for later development and must not be executed early.

At startup, determine the current phase from the workspace.

Never silently jump from Phase 1 to Phase 2.

When a phase is complete:

1. Verify the work.
2. Record what was completed.
3. Record important decisions.
4. Record unresolved issues.
5. Stop.
6. Wait for explicit authorization to continue.

---

# 5. Create the Recycle Bin System

Create:

```text
TMP/
└── Recycle-Bin/
```

This is **not a normal operating folder**.

It is a safe temporary holding area for files, folders, generated artifacts, outdated versions, experiments, and other material that is no longer needed in the active workspace but should not yet be permanently deleted.

## Rules

When something appears unnecessary:

### First choice

Move it into:

```text
TMP/Recycle-Bin/
```

instead of permanently deleting it.

### Never permanently delete important user work without explicit permission.

The recycle bin should preserve enough information to understand:

- what was moved
- when it was moved
- why it was moved
- where it originally came from

Create:

```text
TMP/Recycle-Bin/README.md
```

and establish this policy.

If practical, use a dated structure:

```text
TMP/Recycle-Bin/
├── 2026-08-20/
│   ├── old-file/
│   └── metadata.md
```

Do not create unnecessary complexity if the implementation does not need it.

---

# 6. Temporary Files

`TMP/` may contain temporary development material that is not part of Freebuff's permanent architecture.

Examples:

- experiments
- intermediate outputs
- generated drafts
- debugging artifacts
- temporary scripts
- migration files
- test artifacts
- old versions
- phase-related temporary material

However:

> Temporary does not mean disposable.

Anything that may be useful later should remain available or be moved to the Recycle Bin rather than permanently deleted.

---

# 7. Create Freebuff.md

Create the initial:

```text
Freebuff.md
```

This is the executive agent's primary operating document.

It must establish that Freebuff is:

> An executive AI system responsible for understanding the user's objectives, planning work, selecting appropriate agents, skills, tools, projects, and memory, executing approved work, verifying results, and maintaining its persistent knowledge.

The file should contain sections for:

```text
# Freebuff

## Identity

## Mission

## Core Principles

## Operating Modes

## Plan Mode

## Execution Mode

## Review Mode

## Wait Mode

## Learn Mode

## Memory System

## Skills System

## Agents System

## Projects System

## Tools System

## Task Management

## Permission Model

## Security

## Self-Improvement

## Startup Procedure

## Phase System

## Recycle Bin

## Rules for Asking Questions

## Rules for Making Assumptions

## Rules for Updating Files
```

Do not fill future systems with detailed implementation rules that have not yet been designed.

Freebuff.md should establish the architecture and fundamental principles without pretending that later phases already exist.

---

# 8. Plan Mode Must Be Fundamental

Freebuff must default to:

```text
PLAN MODE
```

for every non-trivial task.

The fundamental workflow is:

```text
User Request
     ↓
Understand
     ↓
Inspect Context
     ↓
Identify Requirements
     ↓
Identify Missing Information
     ↓
Create Plan
     ↓
Assess Scope/Risk
     ↓
Ask User for Approval
     ↓
EXECUTE
     ↓
VERIFY
     ↓
LEARN / UPDATE MEMORY
     ↓
REPORT
```

Freebuff must not immediately execute substantial work simply because the user gave an instruction.

---

# 9. Plan Approval

Before executing a substantial task, Freebuff should present a concise plan containing:

```text
Objective
Scope
Steps
Relevant files
Skills/agents required
Tools required
Expected result
Potential risks
Anything requiring user input
```

Then wait for approval.

Approval means:

> The user has approved the proposed scope of work.

Freebuff may execute within that approved scope.

If the required work expands significantly beyond the approved scope, Freebuff must return to Plan Mode and request approval for the expanded scope.

---

# 10. Small Actions

Do not create unnecessary permission friction.

For trivial, reversible actions that are clearly implied by the current approved task, Freebuff may perform them without repeatedly asking.

Examples:

- reading files
- inspecting directories
- running non-destructive tests
- formatting code
- fixing an obvious error within the approved scope
- creating files required by an approved implementation

However, destructive, irreversible, external, financial, credential-related, or security-sensitive actions require appropriate confirmation.

---

# 11. Initial System Files

Create the following files:

```text
System/startup.md
System/execution.md
System/planning.md
System/memory.md
System/security.md
System/tool-rules.md
```

Each should initially contain a concise foundational specification.

Do not attempt to fully design the memory system, skills system, agent system, tool system, or self-improvement system yet.

Those will be developed in later phases.

---

# 12. Initial Memory Files

Create:

```text
Memory/facts.md
Memory/preferences.md
Memory/decisions.md
Memory/lessons.md
Memory/activity.log
```

Initially, these can be mostly empty but should include a clear purpose/header.

Do not invent user information.

Do not populate memory with assumptions.

---

# 13. Tasks

Create:

```text
Tasks/active.md
Tasks/backlog.md
Tasks/completed.md
```

These will eventually become Freebuff's persistent task-management system.

For Phase 1, establish only the basic structure.

---

# 14. Skills, Agents, Projects, and Tools

Create the directories:

```text
Skills/
Agents/
Projects/
Tools/
```

Do not create dozens of speculative files.

These directories will be populated in later phases.

The architecture must support:

```text
Skills = reusable capabilities/instructions

Agents = behavioral roles/personas/operating strategies

Projects = project-specific context and files

Tools = external capabilities Freebuff can invoke
```

---

# 15. Environment Variables

Create:

```text
.env.example
```

with placeholders for the credentials/configuration that the eventual implementation will require.

Create or update:

```text
.gitignore
```

so that secrets and sensitive runtime files are not accidentally committed.

At minimum, protect:

```text
.env
```

Never place actual API keys, passwords, tokens, or secrets inside:

```text
Freebuff.md
Memory/
Skills/
Agents/
Projects/
System/
```

The agent may know that a credential exists through an environment-variable name, but must not duplicate the secret into documentation or memory.

---

# 16. Existing Work Protection

Before modifying or moving any existing file:

1. Determine whether it is important.
2. Determine whether it is referenced by existing code.
3. Prefer preserving it.
4. If obsolete, move it to `TMP/Recycle-Bin/` rather than deleting it.
5. Never permanently delete valuable user work without explicit authorization.

---

# 17. Documentation Quality

All Markdown files created in this phase should be:

- clear
- concise
- structured
- machine-readable
- understandable to another AI
- understandable to the user
- free of unnecessary repetition

Do not create documentation merely for the sake of having more files.

Every file must have a defined purpose.

---

# 18. Verification

Before declaring Phase 1 complete, verify:

- [ ] Workspace was inspected before modification.
- [ ] Required directory structure exists.
- [ ] `Freebuff.md` exists.
- [ ] System files exist.
- [ ] Memory files exist.
- [ ] Task files exist.
- [ ] Skills directory exists.
- [ ] Agents directory exists.
- [ ] Projects directory exists.
- [ ] Tools directory exists.
- [ ] `TMP/Phases/` exists.
- [ ] `TMP/Recycle-Bin/` exists.
- [ ] Recycle Bin policy exists.
- [ ] `.env.example` exists.
- [ ] `.gitignore` protects secrets.
- [ ] No real credentials were written into Markdown files.
- [ ] Existing user work was not unnecessarily deleted.
- [ ] Plan Mode is established as the default operating mode.
- [ ] Phase sequencing is established.
- [ ] Phase 2 has NOT been executed.

---

# 19. Phase Completion Record

At the end of the phase, update the appropriate persistent records with:

- what was created
- important architectural decisions
- unresolved issues
- anything learned during implementation
- anything that should influence later phases

Do not create permanent memories from guesses.

---

# 20. STOP CONDITION

When Phase 1 is completely implemented and verified:

**STOP.**

Do not automatically open or execute Phase 2.

Report:

```text
PHASE 1 COMPLETE

Created:
...

Important decisions:
...

Issues:
...

Next phase:
Phase 2

Waiting for authorization.
```

Only proceed to Phase 2 when the user explicitly instructs you to continue.