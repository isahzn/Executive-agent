# Phase 6 — Projects System

## Objective

Build Freebuff's **Projects System**.

Projects represent the user's actual work, businesses, products, applications, experiments, clients, and long-running initiatives.

A project is the boundary that organizes:

- project identity
- project purpose
- project decisions
- project-specific context
- project files
- project tasks
- project agents
- project skills
- project memory
- project status

The system must allow Freebuff to know what a project is **without automatically reading the entire project directory**.

**Execute only Phase 6.**

Do not begin Phase 7 or any later phase.

---

# 1. Read Existing Architecture

Before making changes, read:

```text
Freebuff.md

System/startup.md
System/execution.md
System/planning.md
System/memory.md
System/security.md
System/tool-rules.md

Memory/facts.md
Memory/preferences.md
Memory/decisions.md
Memory/lessons.md
Memory/activity.log

Skills/INDEX.md
Agents/INDEX.md
```

Also inspect:

```text
Projects/
Tasks/
Tools/
TMP/
```

Inspect the actual workspace.

Do not assume previous phases were implemented exactly as specified.

---

# 2. Project Definition

A Project is:

> A persistent body of work with its own objective, context, files, decisions, tasks, requirements, and history.

Examples:

```text
Floza
Executive Agent
Freebuff
Client Website
Document Automation
Instagram Reply Agent
Portfolio
```

A project can contain software, business work, research, documents, marketing, or a combination.

---

# 3. Project Directory

The primary location is:

```text
Projects/
```

Each project should normally have its own directory:

```text
Projects/
└── Floza/
```

A project may contain its own files and folders.

---

# 4. Project Metadata

Every project should have a lightweight metadata file.

Use:

```text
Projects/<ProjectName>/PROJECT.md
```

Example:

```text
Projects/
└── Floza/
    └── PROJECT.md
```

`PROJECT.md` is the primary file Freebuff should inspect to understand what a project is.

---

# 5. PROJECT.md Structure

Use:

```text
# Project: [Name]

## Description

## Objective

## Status

## Owner

## Current Priorities

## Important Decisions

## Constraints

## Architecture

## Relevant Skills

## Relevant Agents

## Important Files

## Current Tasks

## Known Issues

## Related Projects

## Last Updated
```

Only use sections that are actually useful.

Do not create unnecessary documentation.

---

# 6. Project Discovery

Freebuff must be able to discover projects without opening every project.

Create:

```text
Projects/INDEX.md
```

It should contain:

```text
Project
Description
Status
Location
Current Priority
```

Example:

```text
| Project | Description | Status | Location |
|---|---|---|---|
| Floza | AI automation business | Active | Projects/Floza |
| Executive Agent | Freebuff system | Active | Projects/Executive-Agent |
```

---

# 7. Critical Context Rule

Freebuff must **NOT automatically read the entire `Projects/` directory**.

At startup:

```text
Projects/
    ↓
Read INDEX.md
    ↓
Determine relevant project
    ↓
Read that project's PROJECT.md
    ↓
Only inspect deeper files when required
```

This is a core architectural rule.

---

# 8. Project Title Recognition

The project directory name should provide an immediate identity.

Example:

```text
Projects/
├── Floza/
├── Executive-Agent/
├── Portfolio/
└── Document-Automation/
```

If the user says:

> "Work on Floza."

Freebuff should immediately associate the request with:

```text
Projects/Floza/
```

Then inspect `PROJECT.md`.

Do not scan unrelated projects.

---

# 9. Project Context Loading

Project context should be loaded progressively.

### Level 1 — Discovery

Load:

```text
Projects/INDEX.md
```

### Level 2 — Identity

Load:

```text
Projects/<Project>/PROJECT.md
```

### Level 3 — Relevant Context

Load only the files relevant to the current task.

### Level 4 — Deep Inspection

Inspect the project code/files only when the task requires it.

This prevents unnecessary context consumption.

---

# 10. Project Boundaries

Freebuff must understand which project a task belongs to.

Example:

```text
User:
Fix the login bug.
```

If the active project is Floza:

```text
Floza → login bug
```

If no project is clearly active:

```text
PLAN
 ↓
Determine project
 ↓
Ask if ambiguity materially affects the work
```

Do not modify the wrong project.

---

# 11. Active Project

Freebuff should conceptually maintain:

```text
ACTIVE PROJECT
```

The active project applies until:

- the user changes projects
- the task clearly belongs to another project
- the project is completed/paused
- Freebuff determines the context is no longer applicable

A session may work across multiple projects, but Freebuff must clearly distinguish them.

---

# 12. Project Switching

If the user says:

> "Now work on the portfolio."

Freebuff should transition:

```text
Floza
 ↓
Portfolio
```

It should load the new project's identity/context.

It should not carry unrelated project assumptions into the new project.

---

# 13. Cross-Project Work

Some tasks legitimately involve multiple projects.

Example:

```text
Executive Agent
+
Freebuff
+
Floza
```

In that situation:

1. Identify all affected projects.
2. Load their relevant metadata.
3. Keep their contexts separate.
4. Identify dependencies.
5. Include the cross-project relationship in the plan.

Do not merge their memories or files.

---

# 14. Project Memory

Project-specific knowledge should remain associated with the project.

For example:

```text
Floza:
Uses Next.js.
Uses a specific CRM architecture.
Has specific branding.
```

This should not automatically become a global Freebuff fact.

Project memory may be represented using the existing memory architecture, such as:

```text
Projects/Floza/memory/
```

or the established global memory structure with project identifiers.

Use whichever architecture was implemented in Phase 2.

Do not create duplicate memory systems unnecessarily.

---

# 15. Project Decisions

Project decisions must be recorded.

Examples:

```text
Database choice
Framework choice
Deployment choice
Architecture choice
Branding decision
Pricing decision
API decision
```

Important decisions should be recoverable after a new session.

Do not force Freebuff to rediscover them every time.

---

# 16. Project Constraints

Projects may contain permanent constraints.

Examples:

```text
Must deploy to VPS.
Must use TypeScript.
Cannot use paid database.
Must remain compatible with Vercel.
```

Freebuff should consider these during planning.

If a user explicitly changes a constraint, update the project documentation according to the memory/decision rules.

---

# 17. Project Status

Projects should support statuses such as:

```text
ACTIVE
PLANNING
PAUSED
COMPLETED
ARCHIVED
ABANDONED
```

The status should be reflected in:

```text
Projects/INDEX.md
```

and, where useful:

```text
PROJECT.md
```

---

# 18. Project Priorities

A project may have current priorities.

Example:

```text
Current Priorities:

1. Finish MVP
2. Fix authentication
3. Deploy
```

These help Freebuff understand what matters now.

Do not treat old priorities as permanent.

Update them when they change.

---

# 19. Project Tasks

Project tasks should connect to the existing Task System.

Example:

```text
Projects/Floza/
Tasks/
```

or:

```text
Tasks/
└── Floza/
```

Use the architecture established elsewhere rather than creating two competing task systems.

Each task should identify its project.

---

# 20. Project and Plan Mode

When a task belongs to a project:

```text
User Request
 ↓
Identify Project
 ↓
Read PROJECT.md
 ↓
Load Relevant Memory
 ↓
Determine Skills
 ↓
Determine Agents
 ↓
Build Plan
 ↓
Request Approval
 ↓
Execute
```

The project provides context.

The plan provides authorization and execution scope.

---

# 21. Project and Skills

Projects may specify preferred skills:

```text
Relevant Skills:
- nextjs
- typescript
- database
```

This does not mean all skills should automatically load.

Freebuff should still select skills based on the current task.

---

# 22. Project and Agents

Projects may specify preferred agents:

```text
Relevant Agents:
- Coding Agent
- QA Agent
```

Again, this is guidance.

The Executive Agent determines which agents are actually needed.

---

# 23. Project and Tools

Projects may specify infrastructure or tool requirements:

```text
Deployment:
Vercel

Database:
PostgreSQL

Repository:
Git
```

Do not place credentials here.

Only describe the required systems.

---

# 24. Project Files

A project may contain:

```text
src/
docs/
assets/
config/
scripts/
tests/
```

Freebuff should not automatically read all of them.

It should inspect only the files relevant to the task.

---

# 25. Project File Discovery

When Freebuff needs to modify something:

1. Identify likely relevant directories/files.
2. Inspect them.
3. Understand dependencies.
4. Modify only what is required.
5. Verify the result.

Do not randomly scan the entire project unless the task explicitly requires a full audit.

---

# 26. Project Isolation

Freebuff must avoid accidental cross-project modifications.

Before modifying a file, establish:

```text
Project
Path
Purpose
Reason for modification
```

For major tasks, include affected projects/files in the approved plan.

---

# 27. Project Dependencies

Projects may depend on other projects.

Example:

```text
Executive Agent
    ↓
Freebuff
    ↓
Floza
```

Record important relationships in:

```text
Related Projects
```

Do not automatically load all dependent projects.

Only load the dependency when relevant.

---

# 28. Project Templates

Do not force every project to have identical contents.

A simple project may contain only:

```text
PROJECT.md
```

A complex software project may contain:

```text
PROJECT.md
src/
tests/
docs/
scripts/
```

The system should scale with the project.

---

# 29. Creating a Project

Freebuff may create a project when the user clearly establishes a new long-term body of work.

Creation process:

```text
Identify project
 ↓
Create directory
 ↓
Create PROJECT.md
 ↓
Update Projects/INDEX.md
 ↓
Record relevant initial decisions
```

Do not create a new project for every tiny task.

---

# 30. Project Naming

Project names should be:

- clear
- stable
- recognizable
- filesystem-safe

Prefer:

```text
Executive-Agent
Document-Automation
Floza
Portfolio
```

Avoid:

```text
newthing123
random
test-final-final
```

unless the user specifically wants that name.

---

# 31. Project Archiving

When a project is completed or abandoned:

1. Update its status.
2. Preserve important files.
3. Remove it from active priority lists if appropriate.
4. Keep it discoverable.
5. Do not destroy historical information.

Archived projects should not normally be loaded into active context.

---

# 32. Recycle Bin

The Recycle Bin is for temporary/deprecated material, not normal project storage.

If a project file is no longer needed:

```text
Project
 ↓
Determine whether reversible
 ↓
Move to TMP/Recycle-Bin if appropriate
```

Do not use the Recycle Bin to hide active project files.

---

# 33. Project Cleanup

Freebuff may identify:

- duplicate files
- obsolete documents
- abandoned experiments
- temporary generated files

But cleanup must follow the approval and destructive-action rules.

Prefer reversible moves over permanent deletion.

---

# 34. Project Health

For substantial projects, Freebuff should be able to determine:

```text
Project Status
Current Objective
Current Priority
Known Issues
Blocked Tasks
Recent Decisions
Technical Health
Documentation Health
```

This should be based on actual project information, not guesses.

---

# 35. Project Summary

Freebuff should be able to produce a concise project summary from:

```text
PROJECT.md
INDEX.md
Relevant memory
Current tasks
Recent decisions
```

It should not need to read the entire project.

---

# 36. Project Context Freshness

Project metadata can become outdated.

When Freebuff notices a contradiction:

```text
PROJECT.md:
Uses Supabase.

Actual configuration:
Uses PostgreSQL directly.
```

Freebuff should not silently assume which is correct.

It should:

1. Investigate.
2. Determine whether the project documentation is stale.
3. Update documentation if the evidence is clear and permitted.
4. Record an important decision if necessary.

---

# 37. Project Documentation Updates

After meaningful project changes, Freebuff should consider whether:

```text
PROJECT.md
```

needs updating.

Update it when changes affect:

- architecture
- status
- objective
- constraints
- important decisions
- major dependencies
- current priorities

Do not rewrite it after every tiny code change.

---

# 38. Project Startup

Update:

```text
System/startup.md
```

to establish:

```text
Workspace Startup
 ↓
Load Freebuff.md
 ↓
Load global memory
 ↓
Read Projects/INDEX.md
 ↓
Determine active/relevant project
 ↓
Read relevant PROJECT.md
 ↓
Load only required project context
```

Never automatically read all project files.

---

# 39. Project Planning Integration

Update:

```text
System/planning.md
```

so plans identify:

```text
Primary Project
Affected Projects
Relevant Project Context
Affected Files
Project Constraints
Project Decisions
```

---

# 40. Project Execution Integration

Update:

```text
System/execution.md
```

so execution knows:

```text
Approved Project Scope
 ↓
Modify only approved/relevant project resources
 ↓
Verify
 ↓
Update project documentation if needed
```

---

# 41. Project Memory Integration

Update:

```text
System/memory.md
```

so it clearly distinguishes:

```text
Global Memory
Project Memory
Task Memory
Temporary Context
```

Project-specific information should remain project-scoped unless there is a genuine reason to promote it globally.

---

# 42. Project Index Maintenance

Whenever a project is:

- created
- renamed
- archived
- restored
- deleted

update:

```text
Projects/INDEX.md
```

The index must remain accurate.

---

# 43. Project Rename

Renaming a project should be treated carefully.

Before renaming:

1. Check references.
2. Check tasks.
3. Check documentation.
4. Check dependencies.
5. Check scripts/configuration.
6. Update the index.
7. Update references where necessary.
8. Verify.

Do not simply rename the folder and assume everything remains valid.

---

# 44. Project Deletion

Permanent project deletion is destructive.

Before permanent deletion:

1. Identify what will be removed.
2. Check dependencies.
3. Prefer Recycle Bin/archive.
4. Request explicit confirmation.
5. Only permanently delete after confirmation.

Never silently delete an entire project.

---

# 45. Cross-Project Knowledge

If a project produces knowledge that is genuinely reusable globally:

```text
Project
 ↓
Identify reusable lesson
 ↓
Executive evaluates
 ↓
Promote to global memory/skill if appropriate
```

Do not automatically turn every project-specific fact into global knowledge.

---

# 46. Project Creation Example

If the user says:

> "I'm starting a new document automation business."

Freebuff should determine whether this represents a new project.

If yes:

```text
Projects/
└── Document-Automation/
    └── PROJECT.md
```

Then establish:

```text
Objective
Status
Current Priorities
Constraints
Initial Decisions
```

Do not invent unknown details.

---

# 47. Project Context Example

If the user later says:

> "Add OCR to the document processor."

Freebuff should:

```text
Identify Document-Automation
 ↓
Read PROJECT.md
 ↓
Inspect relevant memory
 ↓
Determine required skills
 ↓
Determine required agent
 ↓
Inspect relevant code
 ↓
Plan
 ↓
Request approval
 ↓
Execute
```

It should not load unrelated projects.

---

# 48. Verification

Before declaring Phase 6 complete, verify:

- [ ] Projects have a defined purpose.
- [ ] `Projects/` exists.
- [ ] `Projects/INDEX.md` exists.
- [ ] Projects have `PROJECT.md`.
- [ ] Project discovery exists.
- [ ] Freebuff does not automatically read all project files.
- [ ] Project context loads progressively.
- [ ] Project titles can identify projects.
- [ ] Active project concept exists.
- [ ] Project switching exists.
- [ ] Cross-project work is supported.
- [ ] Project memory is separated from global memory.
- [ ] Project decisions are persistent.
- [ ] Project constraints are persistent.
- [ ] Project status exists.
- [ ] Project priorities exist.
- [ ] Projects connect to Tasks.
- [ ] Projects connect to Skills.
- [ ] Projects connect to Agents.
- [ ] Projects can specify tool/infrastructure requirements.
- [ ] Project files are loaded selectively.
- [ ] Project isolation exists.
- [ ] Project dependencies exist.
- [ ] Project creation is defined.
- [ ] Project archiving is defined.
- [ ] Project cleanup respects approval.
- [ ] Project health can be assessed.
- [ ] Project summaries can be generated.
- [ ] Stale project documentation can be detected.
- [ ] Project documentation updates are defined.
- [ ] Startup integrates projects.
- [ ] Planning integrates projects.
- [ ] Execution integrates projects.
- [ ] Memory integrates project scope.
- [ ] Project index maintenance exists.
- [ ] Rename handling exists.
- [ ] Deletion protection exists.
- [ ] Cross-project knowledge promotion exists.
- [ ] Phase 7 has NOT been executed.

---

# 49. Phase Completion

Record:

- what was implemented
- important Project System decisions
- projects created or modified
- unresolved issues
- lessons that should affect future phases

Use the established memory system.

Do not create permanent memories for temporary implementation details.

---

# 50. STOP CONDITION

When Phase 6 is completely implemented and verified:

**STOP.**

Do not automatically execute Phase 7.

Report:

```text
PHASE 6 COMPLETE

Implemented:
...

Projects:
...

Project discovery:
...

Context loading:
...

Project isolation:
...

Cross-project handling:
...

Issues:
...

Next phase:
Phase 7 — Tools & Integrations

Waiting for authorization.
```

Wait for explicit user authorization before continuing.