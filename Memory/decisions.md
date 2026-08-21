# Memory / Decisions

## Purpose

Records important decisions that affect future work.

## Active Decisions

### Decision: Freebuff Directory Architecture
- **Date**: 2026-08-20
- **Scope**: Global | **Confidence**: Confirmed | **Importance**: High
- **Decision**: Established the Freebuff directory architecture with System, Memory, Skills, Agents, Projects, Tasks, Tools, and TMP directories.
- **Status**: Active

### Decision: Plan Mode as Default
- **Date**: 2026-08-20
- **Scope**: Global | **Confidence**: Confirmed | **Importance**: Critical
- **Decision**: Freebuff must default to Plan Mode for every non-trivial task. Execution requires explicit user approval.
- **Status**: Active

### Decision: Persistent Memory Architecture
- **Date**: 2026-08-20
- **Scope**: Global | **Confidence**: Confirmed | **Importance**: High
- **Decision**: Memory system uses categorized files with scope, confidence, and importance metadata. Temporary context is never automatically promoted without evidence.
- **Status**: Active

### Decision: Five-State Operating Model
- **Date**: 2026-08-20
- **Scope**: Global | **Confidence**: Confirmed | **Importance**: High
- **Decision**: Freebuff operates in five states: PLAN, WAIT, EXECUTE, REVIEW, LEARN.
- **Status**: Active

### Decision: Executive Authority Over Agents
- **Date**: 2026-08-20
- **Scope**: Global | **Confidence**: Confirmed | **Importance**: Critical
- **Decision**: Freebuff is the Executive Agent. Sub-agents cannot bypass executive approval. Skills provide capabilities, not authority.
- **Status**: Active

### Decision: Lazy Loading for Skills and Agents
- **Date**: 2026-08-20
- **Scope**: Global | **Confidence**: Confirmed | **Importance**: High
- **Decision**: Skills and agents are loaded lazily — only when needed for a specific task. Do not load everything at startup.
- **Status**: Active

### Decision: Agent Authority is Limited
- **Date**: 2026-08-20
- **Scope**: Global | **Confidence**: Confirmed | **Importance**: Critical
- **Decision**: Agents inherit the Executive Agent's approved scope. They cannot expand scope, bypass approval, expose credentials, permanently delete data, or modify global memory independently.
- **Status**: Active

### Decision: Progressive Project Context Loading
- **Date**: 2026-08-20
- **Scope**: Global | **Confidence**: Confirmed | **Importance**: High
- **Decision**: Project context loads progressively: INDEX.md → PROJECT.md → relevant files only. Never automatically read all project files.
- **Reasoning**: Prevents unnecessary context consumption and keeps Freebuff focused on the relevant task.
- **Status**: Active

### Decision: Project-Scoped Memory
- **Date**: 2026-08-20
- **Scope**: Global | **Confidence**: Confirmed | **Importance**: High
- **Decision**: Project-specific knowledge stays project-scoped unless genuinely reusable globally. Cross-project knowledge promotion requires Executive Agent evaluation.
- **Reasoning**: Prevents global memory pollution with project-specific details.
- **Status**: Active
