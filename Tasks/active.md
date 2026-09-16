# Tasks / Active

## Purpose

Tracks tasks currently being worked on.

## Active Tasks

_No active tasks._

---

## Task Format

When a task becomes active, record it here:

```
## Task: [Task Name]

- **Objective**: [What is the goal?]
- **Scope**: [What is included/excluded?]
- **Status**: [PLAN | EXECUTE | REVIEW | LEARN]
- **Agents**: [Which agents are involved?]
- **Skills**: [Which skills are required?]
- **Linked Project**: [If any]
- **Approval Date**: YYYY-MM-DD
- **Est. Completion**: YYYY-MM-DD
- **Progress**: [What has been done? What remains?]
- **Blockers**: [Any blockers or risks?]
```

---

## Task States

| State | Meaning | Owner | Next State |
|-------|---------|-------|-----------|
| **PLAN** | Planning approved task, building approach | Freebuff | EXECUTE or WAIT |
| **EXECUTE** | Executing approved plan | Agent | REVIEW |
| **REVIEW** | Verifying results meet criteria | QA Agent or Freebuff | LEARN or EXECUTE (if failed) |
| **LEARN** | Recording lessons and updating memory | Freebuff | Complete (move to completed.md) |

---

## Task Movement Rules

### Task Becomes Active
1. User gives instruction for work to be done.
2. Freebuff enters PLAN mode.
3. Freebuff builds and presents plan.
4. User approves plan.
5. Task is recorded in active.md.

### Task Progresses
- PLAN → EXECUTE: User approves plan
- EXECUTE → REVIEW: Agent completes work
- REVIEW → LEARN: Verification passes
- REVIEW → EXECUTE: Verification fails, rework needed
- Any state → WAIT: External dependency or blocker

### Task Completes
- LEARN → completed.md: Task finished, lessons recorded

---

## Resuming Tasks

If Freebuff restarts mid-task:
1. Load this file to see active tasks.
2. Check the task's current status.
3. Resume from where it left off.
4. Verify scope has not changed.
5. Continue execution or review.

---

## Blocking Rules

A task cannot move to EXECUTE without:
- [ ] Clear, approved plan
- [ ] User approval
- [ ] Scope defined and documented
- [ ] Required agents and skills identified
- [ ] No security or permission issues

A task cannot move to REVIEW without:
- [ ] All approved work completed
- [ ] Scope not expanded
- [ ] Agent reports completion

A task cannot move to LEARN without:
- [ ] Verification completed (pass or fail)
- [ ] Outcome documented
- [ ] No dangling work

---

## Abandoned Tasks

If a task is abandoned before completion:
1. Document the reason.
2. Document the state it left off in.
3. Move to backlog.md with a note.
4. Do not delete without user approval.

---

## Rules for Active Task Management

- **Only move active tasks between states**, do not create new states.
- **Record all state changes** so task history is clear.
- **Do not expand active task scope** without user re-approval.
- **Do not pile up active tasks** — keep the list manageable.
- **Do not abandon tasks** without documenting why.