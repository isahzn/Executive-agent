# Phase 4 — Skills System

## Objective

Build Freebuff's **Skills System**.

Skills are reusable capabilities that teach Freebuff **how to perform a category of work**.

The Skills System must allow Freebuff to:

1. Discover available skills.
2. Determine which skills are relevant to a task.
3. Load skills only when needed.
4. Follow skill instructions.
5. Combine multiple skills.
6. Respect skill dependencies.
7. Detect missing skills.
8. Create new skills when appropriate.
9. Improve existing skills when justified.
10. Keep skills separate from agents, projects, memory, and tools.

**Execute only Phase 4.**

Do not begin Phase 5 or any later phase.

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
```

Also inspect:

```text
Skills/
Agents/
Projects/
Tools/
Tasks/
TMP/Phases/
```

Read the completed Phase 4 foundation only after verifying the actual workspace state.

Do not assume previous phases were implemented exactly as specified.

---

# 2. Definition of a Skill

A Skill is:

> A reusable set of instructions, knowledge, procedures, constraints, and best practices that teaches Freebuff how to perform a particular type of work.

Examples:

```text
Next.js development
React UI development
Python development
Database design
Web research
SEO
API integration
Automation design
Prompt engineering
Testing
Debugging
Deployment
Git
Documentation
```

A skill is **not**:

- an agent
- a project
- a memory entry
- an API credential
- a tool
- a personality

---

# 3. Skill vs Agent vs Tool

Maintain this distinction:

```text
Skill
=
How to perform a type of work.

Agent
=
How to behave/operate while performing work.

Tool
=
What external capability can be invoked.

Project
=
Where the work/context belongs.

Memory
=
What Freebuff has learned or knows.
```

Example:

```text
Coding Agent
     +
Next.js Skill
     +
Browser Tool
     +
Floza Project
     +
Relevant Memory
     =
Execution
```

---

# 4. Skill Directory

The primary location is:

```text
Skills/
```

Each reusable skill should normally have its own directory:

```text
Skills/
└── nextjs/
    └── SKILL.md
```

More complex skills may contain supporting resources:

```text
Skills/
└── nextjs/
    ├── SKILL.md
    ├── examples/
    ├── references/
    ├── templates/
    └── scripts/
```

Do not create supporting files unless they provide real value.

---

# 5. Skill Naming

Skill names should be:

- descriptive
- stable
- concise
- lowercase where practical
- easy for Freebuff to discover

Examples:

```text
Skills/
├── nextjs/
├── typescript/
├── frontend/
├── backend/
├── database/
├── web-research/
├── automation/
├── testing/
└── deployment/
```

Avoid vague names such as:

```text
Skills/
└── stuff/
```

---

# 6. SKILL.md

Every skill must have a primary:

```text
SKILL.md
```

The file should be understandable by both humans and AI.

Use a structure similar to:

```text
# Skill: [Name]

## Purpose

## When to Use

## When NOT to Use

## Capabilities

## Workflow

## Rules

## Best Practices

## Constraints

## Dependencies

## Required Tools

## Inputs

## Outputs

## Verification

## Common Failure Modes

## Examples

## Related Skills
```

Do not force every skill to use every section if irrelevant.

---

# 7. Skill Metadata

Where useful, include metadata near the beginning:

```text
Name:
Description:
Version:
Status:
Category:
Dependencies:
Related Skills:
```

Do not create a complicated metadata framework unless the implementation requires it.

The important information is:

- what the skill does
- when it should be used
- what it depends on
- how to verify its work

---

# 8. Skill Discovery

Freebuff should not load every skill into context.

Instead:

```text
User Request
     ↓
Understand Task
     ↓
Determine Required Capabilities
     ↓
Inspect Skill Index / Available Skills
     ↓
Select Relevant Skills
     ↓
Load Relevant SKILL.md files
```

Only load skills that are relevant.

This is essential for context efficiency.

---

# 9. Skill Index

Create a lightweight index so Freebuff can discover available skills without opening every skill.

Create:

```text
Skills/INDEX.md
```

The index should contain:

```text
Skill Name
Purpose
When to Use
Location
Dependencies
```

Example:

```text
| Skill | Purpose | When to Use | Location |
|---|---|---|---|
| Next.js | Next.js application development | Building/modifying Next.js apps | Skills/nextjs/ |
| Web Research | Structured web research | Research tasks | Skills/web-research/ |
```

Keep the index concise.

The full skill instructions remain inside each skill's `SKILL.md`.

---

# 10. Skill Selection

When planning a task, Freebuff should determine:

```text
What capabilities are required?
```

Then select the minimum useful set of skills.

Do not load five skills when two are sufficient.

Example:

```text
Task:
Build a Next.js dashboard.

Required:
- nextjs
- frontend

Potential:
- database
- testing

Only load database/testing if the task actually requires them.
```

---

# 11. Multiple Skills

Freebuff must be able to combine skills.

Example:

```text
Frontend Skill
+
Next.js Skill
+
Database Skill
+
Testing Skill
```

The Executive Agent remains responsible for resolving conflicts.

---

# 12. Skill Dependencies

A skill may depend on another skill.

Example:

```text
Deployment
    ↓
Next.js
    ↓
TypeScript
```

If a required dependency exists:

1. Detect it.
2. Load it if relevant.
3. Avoid unnecessary duplication.

If the dependency does not exist, Freebuff should identify the missing capability rather than pretending it exists.

---

# 13. Skill Conflicts

Different skills may contain conflicting recommendations.

Example:

```text
Skill A:
Use architecture X.

Skill B:
Use architecture Y.
```

Freebuff should not blindly follow both.

It should:

1. Identify the conflict.
2. Determine which skill is more directly relevant.
3. Check project requirements.
4. Check existing project decisions.
5. Check user preferences.
6. Choose the appropriate approach.
7. Ask the user if the conflict materially affects the outcome.

The Executive Agent has final authority over execution strategy.

---

# 14. Skill Priority

When deciding between conflicting instructions, use approximately:

```text
Current User Instruction
        ↓
Approved Plan
        ↓
Project Decisions
        ↓
System Rules
        ↓
Relevant Skill
        ↓
General Best Practice
```

A skill cannot override a higher-level instruction.

---

# 15. Skills Must Not Have Authority

A skill can recommend:

> Deploy using method X.

It cannot independently decide:

> Deploy to production now.

Execution authority comes from the Executive Agent and approval system.

Skills provide capability, not permission.

---

# 16. Skill Inputs

A skill should specify what information it needs.

For example:

```text
## Inputs

Required:
- Project directory
- Framework version

Optional:
- Existing design system
- Deployment target
```

If required information is missing, Freebuff should determine whether it can obtain it from the workspace or whether the user needs to provide it.

---

# 17. Skill Outputs

A skill should describe what successful completion produces.

Example:

```text
## Outputs

- Updated application files
- Passing build
- Relevant tests
- Documentation updates
```

This helps the Review phase verify the result.

---

# 18. Skill Verification

Every important skill should define how its work is verified.

Examples:

```text
Coding:
Run tests/build/type checking.

Research:
Verify sources and claims.

Database:
Validate schema and migrations.

Frontend:
Build and inspect affected routes/components.
```

Never treat the existence of a skill's output as proof that the work succeeded.

---

# 19. Skill Failure

If a skill does not work:

1. Determine why.
2. Attempt reasonable recovery.
3. Check whether another available skill can help.
4. If the problem is reusable knowledge, record it as a lesson.
5. If the skill itself is wrong or incomplete, consider improving it.
6. If improvement would materially change behavior, document the change.

Do not silently rewrite a skill because of one unusual failure.

---

# 20. Skill Creation

Freebuff should be able to create a new skill when:

- the same procedure will likely be reused
- the capability is clearly distinct
- no existing skill adequately covers it
- the procedure is sufficiently understood
- the new skill will reduce future work

Example:

If Freebuff repeatedly performs a specialized deployment process, it may eventually create:

```text
Skills/
└── custom-vps-deployment/
    └── SKILL.md
```

---

# 21. Do Not Create Skills Too Aggressively

A one-time task does not automatically justify a new skill.

Before creating one, Freebuff should ask:

```text
Is this reusable?
Is it sufficiently stable?
Does an existing skill already cover it?
Will storing it improve future execution?
```

If not, keep the knowledge in the appropriate project/task memory instead.

---

# 22. Skill Improvement

Freebuff may identify opportunities to improve a skill based on:

- repeated failures
- user corrections
- successful alternative procedures
- outdated instructions
- missing verification
- new project requirements

Before changing a core skill:

1. Determine whether the improvement is actually reusable.
2. Check whether existing projects depend on the old behavior.
3. Preserve important historical information.
4. Update the skill carefully.
5. Record the important change in memory if appropriate.

---

# 23. Skill Versioning

Where a skill becomes important or complex, support:

```text
Version
Status
Changelog
```

Do not create unnecessary version files for simple skills.

For important changes, record what changed and why.

---

# 24. Skill Scope

Skills should clearly distinguish:

```text
General knowledge
Project-specific knowledge
User-specific preference
Temporary task information
```

Do not put project-specific facts into a general reusable skill.

Example:

Bad:

```text
Next.js skill:
Floza uses Supabase.
```

Good:

```text
Floza project:
Floza uses Supabase.
```

The skill should explain Next.js generally.

---

# 25. Skill Security

Skills must never contain:

- API keys
- passwords
- tokens
- private credentials
- sensitive secrets

They may contain:

```text
Required environment variable:
OPENROUTER_API_KEY
```

but never the actual value.

---

# 26. Skill Resources

A skill may include supporting resources such as:

```text
examples/
references/
templates/
scripts/
```

Only load these resources when needed.

Do not automatically load an entire skill directory into context.

---

# 27. Skill Scripts

If a skill contains scripts:

1. Inspect them before use.
2. Understand what they do.
3. Respect Plan Mode and approval.
4. Do not execute destructive scripts without appropriate authorization.
5. Verify their output.

A script inside a skill is still a tool/action and does not bypass Freebuff's permission system.

---

# 28. Skill Discovery by Semantic Matching

Skill selection should consider meaning, not only exact names.

Example:

User:

> "Make a modern web dashboard."

Freebuff should recognize that this may require:

```text
frontend
web-ui
possibly nextjs
```

even if the user never says "Next.js."

However, if the project uses another framework, project context takes precedence.

---

# 29. Missing Skill Handling

If Freebuff determines:

> "I need a capability that does not exist."

It should enter Plan Mode and decide whether to:

1. Perform the task using existing capabilities.
2. Research the required procedure.
3. Create a new skill.
4. Ask the user for guidance.

Do not fabricate a nonexistent skill.

---

# 30. Skill Creation from User Knowledge

If the user teaches Freebuff a reusable procedure:

```text
User explains process
       ↓
Freebuff determines whether reusable
       ↓
If reusable:
Create/update Skill
       ↓
Verify skill
       ↓
Record important decision/lesson
```

The user's instructions should become reusable only when their scope indicates that they are reusable.

---

# 31. Skill and Memory Relationship

Skills contain:

> How to do something.

Memory contains:

> What Freebuff learned.

Example:

```text
Skill:
How to deploy a Next.js application.

Lesson:
The previous deployment failed because environment variable X was missing.

Project:
Floza uses deployment configuration Y.
```

Keep these separate.

---

# 32. Skill and Project Relationship

Projects may recommend skills.

For example:

```text
Projects/Floza/
```

may indicate:

```text
Required skills:
- nextjs
- typescript
- database
```

But the project should not duplicate the complete skill instructions.

Freebuff should load the skill from:

```text
Skills/
```

---

# 33. Skill and Agent Relationship

Agents may prefer certain skills.

Example:

```text
Coding Agent
    ↓
Usually uses:
- coding
- debugging
- testing
```

But the Executive Agent should determine which skills are actually required for the current task.

Agents do not automatically load every skill.

---

# 34. Initial Skills

Do not attempt to build a huge library during this phase.

Create only the infrastructure.

If useful for testing the system, create a small number of foundational skills such as:

```text
Skills/
├── coding/
│   └── SKILL.md
├── research/
│   └── SKILL.md
└── documentation/
    └── SKILL.md
```

These should be simple test/reference skills, not massive instruction manuals.

Only create them if the current implementation benefits from having real examples.

---

# 35. Startup Integration

Update:

```text
System/startup.md
```

so that startup behavior understands:

```text
Freebuff.md
    ↓
Relevant Memory
    ↓
Task
    ↓
Skill Discovery
    ↓
Load Only Relevant Skills
```

Do not load every skill at startup.

---

# 36. Plan Mode Integration

Update:

```text
System/planning.md
```

so every substantial plan can identify:

```text
Required Skills
Optional Skills
Missing Skills
Skill Dependencies
```

The plan should not execute until required capabilities are understood.

---

# 37. Execution Integration

Update:

```text
System/execution.md
```

so execution follows:

```text
Approved Plan
    ↓
Load Required Skills
    ↓
Execute Skill Procedures
    ↓
Verify
```

Skills cannot bypass approval.

---

# 38. Tool Integration

Update:

```text
System/tool-rules.md
```

to clarify:

```text
Skill
    ↓
May recommend/use tools
    ↓
Tool permissions remain controlled by Freebuff
```

A skill does not automatically receive unlimited tool access.

---

# 39. Skill Index Maintenance

`Skills/INDEX.md` must remain synchronized with the actual Skills directory.

When creating or removing a skill:

1. Update the index.
2. Ensure the location is correct.
3. Ensure the description is accurate.

Do not leave stale skill entries.

---

# 40. Recycle Bin

If a skill is deprecated or replaced:

Do not permanently delete it immediately.

Prefer:

```text
TMP/Recycle-Bin/
```

and record:

```text
Original location
Reason
Date
Replacement
```

Do not allow deprecated skills to remain active in the skill index.

---

# 41. Verification

Before declaring Phase 4 complete, verify:

- [ ] Skills are clearly defined.
- [ ] Skills are separated from agents.
- [ ] Skills are separated from projects.
- [ ] Skills are separated from memory.
- [ ] Skills are separated from tools.
- [ ] `Skills/INDEX.md` exists.
- [ ] Skill discovery is defined.
- [ ] Lazy loading is defined.
- [ ] Skill selection is defined.
- [ ] Multiple skills can work together.
- [ ] Dependencies are supported.
- [ ] Skill conflicts are handled.
- [ ] Skill authority is limited.
- [ ] Inputs are defined.
- [ ] Outputs are defined.
- [ ] Verification is defined.
- [ ] Missing skills are handled.
- [ ] Skill creation is defined.
- [ ] Skill improvement is defined.
- [ ] Skill versioning is supported where appropriate.
- [ ] Skill security rules exist.
- [ ] Skill resources are lazy-loaded.
- [ ] Skill scripts respect approval rules.
- [ ] Skills cannot bypass Plan Mode.
- [ ] Startup integrates skill discovery.
- [ ] Planning integrates skill selection.
- [ ] Execution integrates skill loading.
- [ ] Recycle Bin handles deprecated skills.
- [ ] Phase 5 has NOT been executed.

---

# 42. Phase Completion

Record:

- what was implemented
- important Skill System decisions
- new skills created
- unresolved issues
- improvements discovered for future phases

Use the established memory system.

Do not store temporary implementation details as permanent memories unless they are genuinely useful later.

---

# 43. STOP CONDITION

When Phase 4 is completely implemented and verified:

**STOP.**

Do not automatically execute Phase 5.

Report:

```text
PHASE 4 COMPLETE

Implemented:
...

Skills:
...

Skill discovery:
...

Skill loading:
...

Skill creation/improvement:
...

Issues:
...

Next phase:
Phase 5 — Agents System

Waiting for authorization.
```

Wait for explicit user authorization before continuing.