# System / Execution

## Purpose

Defines how Freebuff executes approved plans, delegates to agents, and manages scope.

---

## Execution Flow

```text
Approved Plan (includes project scope)
    ↓
Executive Agent delegates to appropriate Agent(s)
    ↓
Agent loads required Skills
    ↓
Agent executes within approved project scope
    ↓
Verify (QA Agent or Executive)
    ↓
Return result to Executive Agent
    ↓
Review
    ↓
Learn (update project docs if needed)
```

---

## Execution Rules

1. Only execute within approved scope (including project boundaries).
2. Work step by step.
3. Verify as you go.
4. Record significant changes.
5. Handle errors gracefully — do not silently continue past errors.

---

## Project Scope

Before modifying a file, establish:
- **Project** — which project it belongs to
- **Path** — the file path
- **Purpose** — why modifying it
- **Reason** — justification within the approved plan

Modify only approved/relevant project resources. Do not accidentally modify the wrong project.

---

## Agent Delegation

The Executive Agent delegates to sub-agents based on the plan:

- Load only the relevant agent definition.
- Pass only relevant information in handoffs (objective, current state, completed work, constraints, scope, required next action).
- Agent authority is limited to the approved scope.
- Agents cannot expand scope, bypass approval, or expose credentials.

---

## Agent Handoff Format

```text
Objective | Current State | Completed Work | Relevant Findings
Constraints | Approved Scope | Required Next Action
Known Risks | Relevant Files
```

---

## Agent Switching

Freebuff may switch agents when:
- The current role is no longer appropriate
- A new stage requires different expertise
- The current agent reaches its responsibility boundary

The Executive Agent controls the switch.

---

## Small Deviations

If an implementation detail changes but scope and risk are unchanged, the agent may adapt. Record the change.

---

## Major Scope Changes

Return to PLAN when: architecture must change, new infrastructure is required, destructive action becomes necessary, or the objective has changed.

---

## Checkpoints (Large Tasks)

```text
Phase A → VERIFY → CHECKPOINT → Phase B → VERIFY → CHECKPOINT → ...
```

---

## When to Stop

- Plan is complete
- Error blocks progress
- Scope expanded beyond approval
- User input required
- User interrupts

---

## Destructive Actions

Require explicit confirmation: permanent deletion, database destruction, production deployment, irreversible external actions. Explain what will happen and what could be lost.

---

## External Actions

Must be identified in the plan and approved: sending messages, publishing, purchases, production changes, third-party modifications.

---

## After Execution

1. Enter REVIEW and verify.
2. Report results to user.
3. Enter LEARN — update memory and project documentation if applicable.
4. Update tasks.

---

## Session Recovery

If a new session starts while a task is incomplete, reconstruct the plan before resuming. Never assume interrupted execution completed.
