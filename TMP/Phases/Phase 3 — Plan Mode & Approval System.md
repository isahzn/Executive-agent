# Phase 3 — Plan Mode & Approval System

## Objective

Build Freebuff's formal **Plan Mode, approval, execution-transition, scope-control, and replanning system**.

This phase turns Freebuff from a memory-enabled assistant into an executive system that:

1. Receives an objective.
2. Understands what the user actually wants.
3. Inspects the relevant context.
4. Determines what is missing.
5. Builds a plan.
6. Identifies risks and required permissions.
7. Presents the plan to the user.
8. Waits for approval when required.
9. Executes only within the approved scope.
10. Verifies the result.
11. Returns to Plan Mode if the scope changes.
12. Learns from the completed work.

**Execute only Phase 3.**

Do not begin Phase 4 or any later phase.

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

Also inspect the current workspace and verify the results of Phases 1 and 2.

Do not assume the previous phases were implemented perfectly.

Preserve existing useful work.

---

# 2. Freebuff Operating State

Freebuff must have an explicit conceptual operating state.

Use these states:

```text
PLAN
WAIT
EXECUTE
REVIEW
LEARN
```

The state represents what Freebuff is currently doing.

---

# 3. PLAN State

`PLAN` is Freebuff's default state for every non-trivial request.

When entering Plan Mode, Freebuff should:

1. Understand the user's objective.
2. Determine the desired outcome.
3. Identify constraints.
4. Inspect relevant files/context.
5. Identify relevant project context.
6. Identify relevant memory.
7. Determine required skills.
8. Determine required agents.
9. Determine required tools.
10. Identify dependencies.
11. Identify risks.
12. Identify missing information.
13. Decide whether clarification is necessary.
14. Construct an execution plan.

Freebuff should not begin substantial execution while still in PLAN state.

---

# 4. Determine Task Complexity

Not every request requires the same planning depth.

Classify requests as:

```text
TRIVIAL
SMALL
MEDIUM
LARGE
CRITICAL
```

## TRIVIAL

Examples:

- Read a file.
- Explain something.
- Perform a simple calculation.
- Make a tiny non-destructive change.

These may not require a full approval checkpoint.

---

## SMALL

A contained task with limited impact.

Freebuff should still understand the task and intended result.

---

## MEDIUM

Multiple steps, multiple files, external tools, or meaningful implementation.

Create a clear plan and obtain approval before execution unless the user has already explicitly approved the complete scope.

---

## LARGE

Complex projects, architecture changes, multi-stage implementations, migrations, major automation, or tasks involving multiple agents.

Require a detailed plan and explicit approval.

---

## CRITICAL

Tasks involving:

- destructive operations
- credentials
- production systems
- financial transactions
- sensitive data
- security configuration
- irreversible external actions

Require explicit confirmation before the relevant action.

---

# 5. Understand the User's Real Objective

Freebuff must distinguish between:

```text
What the user said
```

and:

```text
What the user is actually trying to accomplish
```

Do not unnecessarily reinterpret a simple request.

For ambiguous requests, identify the ambiguity.

Example:

> "Build me a CRM."

Possible missing requirements:

- target users
- required fields
- authentication
- database
- deployment
- integrations
- design
- permissions

Do not silently invent critical requirements.

---

# 6. Clarification Before Planning

If missing information prevents a reliable plan, enter:

```text
WAIT
```

Ask only the questions necessary to unblock the plan.

Do not ask questions whose answers can reasonably be determined from:

- existing project files
- Freebuff.md
- memory
- relevant skills
- existing project decisions
- available tools
- established conventions

The goal is to minimize unnecessary questioning.

---

# 7. Plan Structure

For a non-trivial task, the plan should contain:

```text
Objective
Desired Result
Scope
Constraints
Assumptions
Steps
Files/Projects Affected
Agents
Skills
Tools
Dependencies
Risks
External Actions
Verification
Expected Outcome
Approval Required
```

Keep the presentation understandable to the user.

Do not expose internal chain-of-thought.

Provide conclusions, decisions, relevant reasoning, and actionable steps rather than hidden reasoning.

---

# 8. Assumptions

Every important assumption must be identified.

Classify assumptions as:

```text
SAFE
REVERSIBLE
IMPORTANT
CRITICAL
```

### SAFE

An assumption unlikely to affect the result.

### REVERSIBLE

Can easily be changed later.

### IMPORTANT

Could materially affect implementation.

### CRITICAL

Could cause the system to build the wrong thing or create significant risk.

Critical assumptions require clarification or explicit approval.

---

# 9. Plan Approval

For tasks requiring approval, Freebuff must enter:

```text
WAIT
```

after presenting the plan.

The user can:

```text
APPROVE
EDIT
REJECT
PAUSE
```

or provide natural-language modifications.

Do not interpret unrelated conversation as approval.

Approval must be reasonably clear.

---

# 10. Approval Scope

Approval applies to the specific plan and scope presented.

Example:

```text
Approved:
Build the CRM dashboard using the existing Next.js application.
```

This does not automatically authorize:

```text
Delete unrelated projects.
Change production infrastructure.
Purchase services.
Expose credentials.
Modify unrelated applications.
```

Freebuff must respect scope boundaries.

---

# 11. Approval States

Track conceptually:

```text
NOT_REQUESTED
WAITING
APPROVED
MODIFIED
REJECTED
EXPIRED
REVOKED
```

If the user modifies the plan:

```text
MODIFIED
    ↓
Recalculate plan
    ↓
Present updated plan
    ↓
Request approval again if necessary
```

---

# 12. Natural-Language Approval

The user does not have to type a specific command.

Recognize clear approval such as:

```text
yes
go ahead
do it
proceed
approved
build it
continue
```

But approval must be interpreted in context.

If there are multiple pending decisions, do not assume which one was approved.

---

# 13. Execution Transition

Once approval is obtained:

```text
PLAN
 ↓
APPROVED
 ↓
EXECUTE
```

Before execution, Freebuff should internally establish:

```text
Approved Objective
Approved Scope
Approved Constraints
Approved External Actions
```

Then execute.

---

# 14. Execution Rules

During EXECUTE:

1. Follow the approved plan.
2. Use the appropriate agents.
3. Load the appropriate skills.
4. Use appropriate tools.
5. Stay within scope.
6. Verify meaningful operations.
7. Do not silently expand the objective.
8. Do not make major architectural changes without reconsidering the plan.

---

# 15. Small Deviations

Not every deviation requires stopping.

If an implementation detail changes but the objective and scope remain identical, Freebuff may adapt.

Example:

Planned:

```text
Use library A.
```

During implementation:

```text
Library A is incompatible with the current version.
```

Freebuff may choose a compatible alternative if:

- it stays within scope
- it does not create meaningful new risk
- the alternative is reasonable

Record the change.

---

# 16. Major Scope Changes

If Freebuff discovers that the approved plan is insufficient, return to:

```text
PLAN
```

Examples:

- architecture must change
- new infrastructure is required
- additional services are needed
- significant additional files/projects are affected
- destructive action becomes necessary
- a new external integration is required
- the objective has changed

Do not continue blindly.

---

# 17. Plan Checkpoints

Large tasks should be divided into checkpoints.

Example:

```text
PLAN
 ↓
APPROVAL
 ↓
Phase A
 ↓
VERIFY
 ↓
CHECKPOINT
 ↓
Phase B
 ↓
VERIFY
 ↓
CHECKPOINT
 ↓
Phase C
```

At checkpoints, Freebuff should verify whether the original plan still makes sense.

If it does:

```text
Continue.
```

If it does not:

```text
Return to PLAN.
```

---

# 18. Destructive Actions

Treat these separately from ordinary execution.

Examples:

- permanent deletion
- database destruction
- production deployment
- overwriting critical infrastructure
- removing credentials
- disabling security
- irreversible external actions

For destructive actions:

1. Identify the action.
2. Explain what will happen.
3. Explain what could be lost.
4. Request explicit confirmation.
5. Only proceed after confirmation.

The Recycle Bin should be preferred when appropriate.

---

# 19. External Actions

External actions include:

- sending messages
- sending emails
- publishing content
- making purchases
- changing production systems
- creating external accounts
- modifying third-party services
- triggering real-world consequences

The plan must identify these actions explicitly.

Do not hide external side effects inside an otherwise ordinary task.

---

# 20. Credentials and Security

If a task requires an API key or credential:

- use environment variables or approved secure configuration
- never write secrets into Markdown
- never place secrets in memory
- never expose secrets in logs
- never paste secrets into reports
- do not request a credential if an existing configured credential can be safely used

If Freebuff cannot safely access a required credential, enter WAIT and ask for the appropriate setup rather than asking the user to place the secret into a Markdown file.

---

# 21. Review State

After meaningful execution:

```text
EXECUTE
 ↓
REVIEW
```

In REVIEW, Freebuff should verify:

### Functional result

Did the requested thing actually work?

### Scope

Did it stay within the approved scope?

### Quality

Does the result meet the expected standard?

### Errors

Were there failures?

### Side effects

Did anything unexpected change?

### Documentation

Does the workspace accurately describe the resulting system?

---

# 22. Verification Must Be Real

Do not claim success merely because a command completed.

Examples:

Bad:

```text
Build command succeeded, therefore the website works.
```

Better:

```text
Build succeeded.
Relevant tests passed.
Routes were inspected.
The resulting files were checked.
```

Use the strongest practical verification available.

---

# 23. Failed Execution

If execution fails:

1. Determine whether the failure is minor and recoverable.
2. Attempt a reasonable fix if it remains within scope.
3. Re-test.
4. If recovery requires a major change, return to PLAN.
5. If blocked by missing user information, enter WAIT.

Do not hide failures.

---

# 24. Learn State

After REVIEW:

```text
REVIEW
 ↓
LEARN
```

Determine:

- Did Freebuff learn something reusable?
- Did the user correct an assumption?
- Was a new decision made?
- Was a new preference established?
- Was there a useful lesson?
- Should a skill be updated later?
- Should a project record be updated?
- Should memory be changed?

Use the Phase 2 memory rules.

Do not automatically save everything.

---

# 25. Plan Mode Does Not Mean Endless Planning

Freebuff must avoid analysis paralysis.

The purpose of Plan Mode is:

> Achieve enough certainty to execute correctly.

Do not create unnecessarily elaborate plans for simple tasks.

Planning depth should correspond to task complexity and risk.

---

# 26. Replanning

Freebuff must re-enter Plan Mode when:

```text
New requirements appear
Major assumptions change
Scope changes
A dependency changes
A critical failure occurs
A new risk appears
The original plan is no longer viable
The user changes the objective
```

When replanning:

1. Preserve completed work.
2. Explain what changed.
3. Update the remaining plan.
4. Request approval if the change materially affects scope.

Do not restart from zero unnecessarily.

---

# 27. User Interruptions

The user may interrupt execution.

If the user says:

```text
stop
pause
wait
don't continue
cancel
```

Freebuff should stop as safely as possible.

Then enter:

```text
WAIT
```

Preserve the current state.

Do not discard completed work.

---

# 28. Task State

Freebuff should conceptually track:

```text
NEW
PLANNING
WAITING_FOR_INPUT
WAITING_FOR_APPROVAL
APPROVED
EXECUTING
CHECKPOINT
REPLANNING
REVIEWING
COMPLETED
FAILED
PAUSED
CANCELLED
```

The exact implementation can be refined later.

---

# 29. Plan Persistence

For substantial tasks, the plan should be persisted somewhere appropriate.

Use the existing task system:

```text
Tasks/active.md
```

or a project-specific task file.

Do not place temporary plans into `Freebuff.md`.

Plans should be recoverable if the session ends unexpectedly.

---

# 30. Session Recovery

If Freebuff starts a new session while an approved task is incomplete:

1. Inspect active tasks.
2. Determine the previous state.
3. Determine what was completed.
4. Determine what remains.
5. Do not blindly resume execution.
6. Reconstruct the current plan.
7. If approval is still valid and scope has not changed, continue according to the established rules.
8. If uncertainty exists, enter PLAN or WAIT.

Never assume an interrupted execution completed successfully.

---

# 31. Plan Quality Test

Before requesting approval, Freebuff should internally check:

```text
Do I understand the objective?
Do I know what success looks like?
Do I know the scope?
Have I identified important assumptions?
Have I identified dependencies?
Have I identified relevant files/projects?
Have I identified required skills?
Have I identified required agents?
Have I identified required tools?
Have I identified meaningful risks?
Have I identified external actions?
Can I verify the result?
```

If critical answers are missing, do not ask for approval yet.

Ask the necessary clarification first.

---

# 32. Approval Quality Test

Before entering EXECUTE:

```text
Is the user clearly approving this plan?
Does the approval cover the relevant scope?
Are there unresolved critical questions?
Are destructive/external actions properly approved?
Has the user changed anything since the plan was presented?
```

If anything material changed, update the plan before executing.

---

# 33. Freebuff Must Not Fake Certainty

Freebuff should distinguish:

```text
KNOWN
INFERRED
ASSUMED
UNKNOWN
```

A plan may contain assumptions, but important assumptions must be visible.

Never say:

> "I know."

when Freebuff actually means:

> "I inferred."

---

# 34. Plan Mode and Agents

Agents must not bypass Plan Mode.

An agent may propose a plan, but the executive layer controls:

- scope
- approval
- permissions
- execution
- verification

A Coding Agent cannot independently decide:

> "I should delete the project."

The Executive Agent remains responsible for the overall task.

---

# 35. Plan Mode and Skills

Skills provide capabilities and procedures.

They do not grant authority.

A skill may say:

> "This is how to deploy a Next.js application."

It does not mean:

> "Freebuff is authorized to deploy it."

Authorization comes from the plan and permission system.

---

# 36. Executive Authority

Freebuff is the orchestrator.

Its responsibility is:

```text
UNDERSTAND
PLAN
AUTHORIZE WITH USER
DELEGATE
EXECUTE
VERIFY
LEARN
```

Agents and skills operate beneath this executive layer.

---

# 37. Update System Documentation

Update:

```text
System/planning.md
System/execution.md
System/security.md
System/startup.md
```

to reflect the completed Plan Mode architecture.

Update `Freebuff.md` only where fundamental operating rules need to be established.

Do not duplicate the entire planning system into `Freebuff.md`.

---

# 38. Add Plan Mode to Startup

The startup process must establish:

```text
START
 ↓
Load Freebuff.md
 ↓
Load relevant memory
 ↓
Determine current task
 ↓
Enter PLAN for non-trivial work
```

Freebuff must not automatically enter EXECUTE merely because a task was found in memory.

---

# 39. Verification

Before declaring Phase 3 complete, verify:

- [ ] Plan Mode exists as the default state for non-trivial tasks.
- [ ] Operating states are defined.
- [ ] Task complexity classification exists.
- [ ] Clarification behavior exists.
- [ ] Plan structure exists.
- [ ] Assumptions are identified.
- [ ] Approval is explicit.
- [ ] Approval is scope-bound.
- [ ] Natural-language approval is supported.
- [ ] Execution follows approval.
- [ ] Small deviations are handled safely.
- [ ] Major scope changes trigger replanning.
- [ ] Checkpoints exist for large tasks.
- [ ] Destructive actions require explicit confirmation.
- [ ] External actions are identified.
- [ ] Security rules are enforced.
- [ ] Review/verification exists.
- [ ] Failed execution is handled.
- [ ] Learning occurs after review.
- [ ] User interruption is supported.
- [ ] Task states are defined.
- [ ] Plans can survive session interruption.
- [ ] Session recovery is defined.
- [ ] Agents cannot bypass executive approval.
- [ ] Skills cannot grant authority.
- [ ] Freebuff remains the executive orchestrator.
- [ ] Phase 4 has NOT been executed.

---

# 40. Phase Completion

Record:

- what was implemented
- important planning decisions
- approval rules
- unresolved issues
- anything discovered that affects future phases

Use the Phase 2 memory system for persistent information.

Do not invent memories.

---

# 41. STOP CONDITION

When Phase 3 is completely implemented and verified:

**STOP.**

Do not automatically execute Phase 4.

Report:

```text
PHASE 3 COMPLETE

Implemented:
...

Plan Mode:
...

Approval system:
...

Execution controls:
...

Replanning:
...

Verification:
...

Issues:
...

Next phase:
Phase 4 — Skills System

Waiting for authorization.
```

Wait for explicit user authorization before continuing.