# Phase 5 — Agents System

## Objective

Build Freebuff's **Agents System**.

Agents define **how Freebuff should operate while performing a task**.

Skills define what Freebuff knows how to do. Agents define the role, behavior, priorities, methodology, decision-making style, and operating constraints used while doing it.

The Agents System must allow Freebuff to:

1. Discover available agents.
2. Understand an agent's purpose.
3. Select the appropriate agent for a task.
4. Load an agent definition when needed.
5. Combine agents when useful.
6. Switch agents during a task.
7. Create new agents when justified.
8. Improve agents based on experience.
9. Keep agents separate from skills, memory, projects, and tools.
10. Ensure agents cannot bypass the Executive Agent's approval and security controls.

**Execute only Phase 5.**

Do not begin Phase 6 or any later phase.

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
```

Also inspect:

```text
Agents/
Projects/
Tools/
Tasks/
TMP/Phases/
TMP/Recycle-Bin/
```

Inspect the actual implementation rather than assuming previous phases were completed perfectly.

---

# 2. Definition of an Agent

An Agent is:

> A reusable operating role that determines how Freebuff approaches, reasons about, prioritizes, delegates, executes, and reviews a particular category of work.

An agent can define:

- role
- objectives
- priorities
- behavior
- methodology
- decision-making principles
- communication style
- preferred skills
- preferred tools
- verification approach
- constraints
- escalation rules

An agent must not contain secrets.

---

# 3. Agent vs Skill

Maintain this distinction:

```text
Agent
=
How Freebuff operates.

Skill
=
How Freebuff performs a capability.
```

Example:

```text
Coding Agent
+
Next.js Skill
+
Testing Skill
+
Browser Tool
=
Building a web application
```

The Coding Agent does not need to contain all Next.js knowledge.

The Next.js Skill contains that knowledge.

---

# 4. Agent vs Executive Agent

Freebuff itself is the **Executive Agent**.

Other agents operate underneath it.

Conceptually:

```text
                    EXECUTIVE AGENT
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Coding Agent     Research Agent   Business Agent
        │                │                │
      Skills           Skills           Skills
        │                │                │
      Tools            Tools            Tools
```

The Executive Agent remains responsible for:

- overall objective
- planning
- approval
- scope
- permissions
- delegation
- final verification
- memory updates

Sub-agents cannot override the Executive Agent.

---

# 5. Agent Directory

The primary location is:

```text
Agents/
```

Each agent should normally have:

```text
Agents/
└── Coding-Agent.md
```

Use clear, descriptive names.

Examples:

```text
Agents/
├── Coding-Agent.md
├── Research-Agent.md
├── Business-Agent.md
├── Product-Agent.md
├── Design-Agent.md
└── QA-Agent.md
```

Do not create unnecessary agents.

---

# 6. Agent File Structure

Each agent definition should contain, where relevant:

```text
# Agent: [Name]

## Identity

## Purpose

## Responsibilities

## Primary Objectives

## Priorities

## Operating Principles

## Decision-Making

## Workflow

## Preferred Skills

## Preferred Tools

## Inputs

## Outputs

## Verification

## Escalation Rules

## Constraints

## Failure Handling

## Communication

## Related Agents
```

The exact sections may vary according to the agent.

---

# 7. Agent Identity

Each agent should clearly define:

```text
Name
Role
Purpose
Scope
```

Example:

```text
Name:
Coding Agent

Role:
Software engineering specialist

Purpose:
Design, implement, debug, test, and improve software.

Scope:
Software development tasks delegated by the Executive Agent.
```

---

# 8. Agent Priorities

Agents should have explicit priorities.

Example:

```text
Coding Agent priorities:

1. Correctness
2. Security
3. Maintainability
4. Simplicity
5. Performance
```

Priorities help resolve tradeoffs.

Do not create arbitrary priorities without a reason.

---

# 9. Agent Behavior

Define how the agent should operate.

For example, a Coding Agent may:

- inspect the existing code before modifying it
- understand architecture before implementing
- avoid unnecessary rewrites
- reuse existing components
- test changes
- verify builds
- explain significant architectural decisions

The behavior should be actionable rather than vague personality text.

---

# 10. Agent Communication

Agents should communicate according to their role.

However:

> The Executive Agent controls the final user-facing interaction.

A sub-agent may produce technical findings, recommendations, or execution results.

The Executive Agent decides what information is relevant to the user.

---

# 11. Agent Selection

During Plan Mode, Freebuff should determine whether a specialized agent is useful.

Workflow:

```text
Task
 ↓
Understand objective
 ↓
Determine required roles
 ↓
Inspect Agents/INDEX.md
 ↓
Select agent(s)
 ↓
Load relevant agent definitions
 ↓
Continue planning
```

Do not automatically load every agent.

---

# 12. Agent Index

Create:

```text
Agents/INDEX.md
```

It should provide lightweight discovery information:

```text
Agent
Purpose
When to Use
Preferred Skills
Location
```

Example:

```text
| Agent | Purpose | When to Use | Location |
|---|---|---|---|
| Coding Agent | Software engineering | Building/debugging software | Agents/Coding-Agent.md |
| Research Agent | Research and investigation | Information gathering | Agents/Research-Agent.md |
```

Keep it concise.

---

# 13. Agent Selection Criteria

Select agents based on:

- task objective
- required expertise
- project requirements
- required skills
- risk
- complexity
- verification requirements

Do not select an agent merely because its name sounds relevant.

---

# 14. One Agent vs Multiple Agents

Use one agent when one role is sufficient.

Use multiple agents when the task genuinely benefits from different perspectives or responsibilities.

Example:

```text
Website project:

Executive Agent
    ↓
Research Agent
    ↓
Design Agent
    ↓
Coding Agent
    ↓
QA Agent
```

Do not use multiple agents merely for appearance.

---

# 15. Sequential Agent Workflow

Agents can operate sequentially:

```text
Research Agent
      ↓
Design Agent
      ↓
Coding Agent
      ↓
QA Agent
```

Each agent should receive the relevant approved context and outputs from the previous stage.

Do not dump unnecessary context into every agent.

---

# 16. Parallel Agents

Where practical, independent work may be performed conceptually in parallel.

Example:

```text
             Executive
                 │
        ┌────────┴────────┐
        ↓                 ↓
Research Agent       Competitor Agent
        │                 │
        └────────┬────────┘
                 ↓
             Executive
```

The Executive Agent should combine and evaluate their outputs.

Do not allow conflicting agents to independently perform destructive actions.

---

# 17. Agent Handoffs

When switching agents, pass only relevant information.

A handoff should contain:

```text
Objective
Current state
Completed work
Relevant findings
Constraints
Approved scope
Required next action
Known risks
Relevant files
```

Avoid passing irrelevant conversation history.

---

# 18. Agent Switching

Freebuff may switch agents when:

- the current role is no longer appropriate
- a new stage requires different expertise
- a specialized skill is required
- the current agent reaches its responsibility boundary

Example:

```text
Coding Agent
     ↓
Discovers database architecture issue
     ↓
Backend/Database Agent
```

The Executive Agent controls the switch.

---

# 19. Agent Authority

Agents do not have unrestricted authority.

They inherit the Executive Agent's approved scope.

An agent must not:

- expand scope
- bypass approval
- expose credentials
- permanently delete data without authorization
- make external changes outside the approved plan
- alter global memory without following memory rules
- modify another agent's definition without appropriate authorization

---

# 20. Agent Permissions

The system should conceptually support:

```text
READ
WRITE
EXECUTE
EXTERNAL
DESTRUCTIVE
```

An agent may have different permissions depending on its role.

For example:

```text
Research Agent:
READ + RESEARCH

Coding Agent:
READ + WRITE + EXECUTE

Deployment Agent:
READ + WRITE + EXTERNAL
```

Permissions do not override user approval.

---

# 21. Agent Scope

An agent should operate only within its assigned responsibility.

Example:

```text
Coding Agent:
Build the application.

Not:
Decide the company's pricing strategy.
```

The Executive Agent can delegate additional responsibilities when necessary.

---

# 22. Agent Instructions vs User Instructions

The user has higher priority than an agent's default preferences.

Example:

Agent:

> Prefer TypeScript.

User:

> Use JavaScript for this project.

The agent should follow the user's current approved requirement.

Do not modify the agent globally because of a project-specific choice.

---

# 23. Agent Instructions vs Project Decisions

Project decisions should normally take precedence over an agent's generic defaults.

Example:

```text
Agent:
Use PostgreSQL when appropriate.

Project:
This project already uses MySQL.

Result:
Use MySQL unless there is a justified reason to change it.
```

---

# 24. Agent and Skills

Agents should recommend or select relevant skills.

Example:

```text
Coding Agent
    ↓
coding
typescript
nextjs
testing
debugging
```

But the Executive Agent remains responsible for the final skill selection.

Do not automatically load every skill associated with an agent.

---

# 25. Agent and Tools

Agents may specify preferred tools.

Example:

```text
Research Agent:
- web research
- browser
- document analysis
```

Tools remain subject to:

- system rules
- permissions
- approved plan
- security rules

---

# 26. Agent Verification

Each agent should define what successful work looks like.

Example:

```text
Coding Agent:

Verification:
- type checking
- build
- tests
- inspect affected files
```

Example:

```text
Research Agent:

Verification:
- source quality
- cross-check important claims
- distinguish fact from inference
```

The Executive Agent performs final verification.

---

# 27. Agent Failure

If an agent fails:

1. Identify the failure.
2. Determine whether it can recover.
3. Attempt recovery if within scope.
4. Consider another agent if appropriate.
5. Return to Plan Mode if the solution requires significant scope change.
6. Record a reusable lesson if appropriate.

Do not hide agent failures.

---

# 28. Agent Creation

Freebuff may create a new agent when:

- a distinct recurring role exists
- the role cannot be adequately represented by an existing agent
- repeated tasks benefit from specialized behavior
- responsibilities are sufficiently stable

Before creating an agent, ask:

```text
Is this genuinely a distinct role?
Could an existing agent handle it?
Will it be reused?
Does it need different priorities or methodology?
```

Avoid creating agents for one-off tasks.

---

# 29. Agent Improvement

Freebuff may identify improvements based on:

- repeated failures
- user corrections
- better workflows
- new requirements
- outdated behavior

Before modifying an agent:

1. Determine whether the improvement is reusable.
2. Check affected projects.
3. Preserve important historical information.
4. Update the agent carefully.
5. Record significant changes.

Do not constantly rewrite agents after every task.

---

# 30. Agent Versioning

Important agents may contain:

```text
Version
Status
Changelog
```

Possible statuses:

```text
ACTIVE
EXPERIMENTAL
DEPRECATED
ARCHIVED
```

Deprecated agents should not normally be selected for new tasks.

---

# 31. Agent Testing

When creating or significantly modifying an agent, test it with representative scenarios.

Test:

- correct task selection
- incorrect task rejection
- skill selection
- scope handling
- permission handling
- failure handling
- verification behavior

Do not consider an agent reliable simply because its Markdown file exists.

---

# 32. Agent Memory

Agents should not maintain independent hidden memories.

Persistent information belongs in the established memory system or project memory.

An agent can recommend:

> "This should be remembered."

The Executive Agent determines whether and where it should be stored.

---

# 33. Agent Self-Modification

Agents must not silently modify their own definitions.

If an agent determines that its instructions are inadequate:

```text
Agent
 ↓
Report issue
 ↓
Executive evaluates
 ↓
Plan change
 ↓
Approval if necessary
 ↓
Modify agent
 ↓
Verify
```

This prevents uncontrolled self-modification.

---

# 34. Agent Security

Agent files must never contain:

- API keys
- passwords
- access tokens
- private credentials
- secret values

They may reference environment variables by name.

---

# 35. Recycle Bin

If an agent is deprecated:

1. Remove it from `Agents/INDEX.md`.
2. Mark it deprecated or archive it.
3. Prefer moving its old definition into:

```text
TMP/Recycle-Bin/
```

if it is no longer part of the active system.

Record:

```text
Original location
Reason
Date
Replacement
```

Do not permanently delete useful historical agent definitions without authorization.

---

# 36. Initial Agents

Do not create a huge collection of agents.

Create a minimal useful foundation.

Recommended initial agents:

```text
Agents/
├── INDEX.md
├── Coding-Agent.md
├── Research-Agent.md
└── QA-Agent.md
```

Only create additional agents if the existing workspace already requires them.

### Coding Agent

Focus:

- software implementation
- debugging
- architecture within assigned scope
- testing
- code quality

### Research Agent

Focus:

- investigation
- information gathering
- source evaluation
- synthesis
- uncertainty identification

### QA Agent

Focus:

- testing
- verification
- finding defects
- checking requirements
- regression detection

These are foundational examples, not a requirement to permanently use exactly these agents.

---

# 37. Startup Integration

Update:

```text
System/startup.md
```

to include:

```text
Freebuff.md
    ↓
Relevant Memory
    ↓
Current Task
    ↓
Determine Required Agents
    ↓
Load Relevant Agent Definitions
    ↓
Continue Planning
```

Do not load every agent at startup.

---

# 38. Planning Integration

Update:

```text
System/planning.md
```

so plans can identify:

```text
Primary Agent
Supporting Agents
Agent Responsibilities
Agent Handoffs
Agent Dependencies
```

Agent selection must occur during planning for substantial tasks.

---

# 39. Execution Integration

Update:

```text
System/execution.md
```

so execution follows:

```text
Approved Plan
    ↓
Executive Agent
    ↓
Delegate to Agent
    ↓
Load Required Skills
    ↓
Execute
    ↓
Verify
    ↓
Return Result to Executive
```

---

# 40. Memory Integration

Update:

```text
System/memory.md
```

to establish:

> Agents can provide information that may be useful for memory, but the Executive Agent controls persistence according to the Memory System.

Do not create separate hidden agent memories.

---

# 41. Tool Integration

Update:

```text
System/tool-rules.md
```

to establish:

> Agent preference for a tool does not grant permission to use it.

Tool access remains controlled by Freebuff's permission and security system.

---

# 42. Agent Discovery Efficiency

Freebuff should use:

```text
Agents/INDEX.md
```

for initial discovery.

Only open an agent's complete Markdown file after determining that it is relevant.

This preserves context.

---

# 43. Verification

Before declaring Phase 5 complete, verify:

- [ ] Agents are clearly defined.
- [ ] Agents are separated from Skills.
- [ ] Agents are separated from Projects.
- [ ] Agents are separated from Memory.
- [ ] Agents are separated from Tools.
- [ ] Freebuff is established as the Executive Agent.
- [ ] `Agents/INDEX.md` exists.
- [ ] Agent discovery exists.
- [ ] Agent selection exists.
- [ ] Agent handoffs exist.
- [ ] Sequential agents are supported.
- [ ] Parallel agents are conceptually supported where appropriate.
- [ ] Agent switching exists.
- [ ] Agent authority is limited.
- [ ] Agent permissions are defined.
- [ ] Agent scope is defined.
- [ ] User instructions take precedence over agent defaults.
- [ ] Project decisions take precedence over generic agent defaults.
- [ ] Agent/Skill integration exists.
- [ ] Agent/Tool integration exists.
- [ ] Agent verification exists.
- [ ] Agent failure handling exists.
- [ ] Agent creation is defined.
- [ ] Agent improvement is defined.
- [ ] Agent versioning is supported.
- [ ] Agent testing is defined.
- [ ] Agents do not maintain hidden independent memory.
- [ ] Agent self-modification is controlled.
- [ ] Security rules are enforced.
- [ ] Deprecated agents can be recycled.
- [ ] Startup integrates agent discovery.
- [ ] Planning integrates agent selection.
- [ ] Execution integrates delegation.
- [ ] Phase 6 has NOT been executed.

---

# 44. Phase Completion

Record:

- what was implemented
- important Agent System decisions
- agents created
- unresolved issues
- lessons that should affect future phases

Use the established memory system.

Do not create permanent memories for temporary implementation details.

---

# 45. STOP CONDITION

When Phase 5 is completely implemented and verified:

**STOP.**

Do not automatically execute Phase 6.

Report:

```text
PHASE 5 COMPLETE

Implemented:
...

Agents:
...

Agent selection:
...

Delegation:
...

Agent permissions:
...

Agent/Skill integration:
...

Issues:
...

Next phase:
Phase 6 — Projects System

Waiting for authorization.
```

Wait for explicit user authorization before continuing.