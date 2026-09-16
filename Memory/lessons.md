# Memory / Lessons

## Purpose

Records lessons learned from mistakes, failures, experiments, and successful approaches.

## Recording Rules

- **Record**: Problems encountered, root causes, lessons extracted, future rules.
- **Avoid**: Speculation, blame, one-time observations without pattern.
- **Format**: Clear problem, root cause, lesson, actionable future rule.

## Lesson Template

```
### Lesson: [Name]
- **Date**: YYYY-MM-DD
- **Problem**: [What went wrong?]
- **Root Cause**: [Why did it happen?]
- **Lesson**: [What was learned?]
- **Future Rule**: [How to prevent this in future?]
- **Scope**: Global | Project [name]
- **Status**: Active | Superseded
```

---

## Active Lessons

### Lesson: Case-Sensitive Filesystem Issue on Windows
- **Date**: 2026-08-20
- **Problem**: Running `rm -rf Tmp/` also deleted `TMP/` on Windows (case-insensitive filesystem).
- **Root Cause**: Did not account for case-insensitive filesystem behavior when using bash commands.
- **Lesson**: Windows filesystems are case-insensitive. Directory names differing only in case are treated as the same directory.
- **Future Rule**: On Windows, never use `rm -rf` for directories that share a name (case-insensitive) with a directory you want to keep. Verify the exact directory path before destructive operations. Consider using different names entirely.
- **Scope**: Global
- **Status**: Active

### Lesson: Always Read Before Modifying
- **Date**: 2026-08-20
- **Problem**: Without reading existing files before modification, risk overwriting important content.
- **Root Cause**: Assumed file structure without inspecting actual content.
- **Lesson**: Files often contain more structure and dependencies than expected. Assumptions lead to mistakes.
- **Future Rule**: Always read a file completely before modifying it. Understand its structure, dependencies, and purpose. Make minimal changes. Never overwrite without understanding what you're overwriting.
- **Scope**: Global
- **Status**: Active

### Lesson: Load Memory Selectively
- **Date**: 2026-08-20
- **Problem**: Loading all memory files at startup creates cognitive overload and context bloat.
- **Root Cause**: Assumed all memory is needed for all tasks.
- **Lesson**: Memory should be loaded contextually. Load only what is relevant to the current task.
- **Future Rule**: At startup, always load `decisions.md` (establishes active decisions). Load other memory files only if relevant to the current task. Do not blindly load everything.
- **Scope**: Global
- **Status**: Active

### Lesson: Scope Expansion is the Biggest Risk
- **Date**: 2026-08-20
- **Problem**: If scope is not explicitly managed, tasks expand beyond approval.
- **Root Cause**: Ambiguity about what is in-scope and what is not. User requests interpreted as expanding scope.
- **Lesson**: Scope creep happens silently and frequently. It must be actively prevented.
- **Future Rule**: Always define scope explicitly before execution. During execution, stop immediately if scope appears to expand. Ask user for re-approval. Do not assume new requests are in-scope.
- **Scope**: Global
- **Status**: Active

---

## Superseded Lessons

_None yet._

---

## Archived Lessons

_None yet._

---

## How to Record Lessons

When a mistake happens or an experiment completes:

1. **Identify**: Is there a lesson here? Something to prevent in future?
2. **Root Cause**: Why did this happen? What was the underlying issue?
3. **Extract Lesson**: What principle should guide future behavior?
4. **Actionable Rule**: What specific rule prevents this in future?
5. **Add to file**: Record with date, problem, cause, lesson, rule, status.

Example mistake → lesson flow:
- **Mistake**: Modified a file without reading it first, broke existing functionality.
- **Root Cause**: Assumed file structure without inspection.
- **Lesson**: Never assume structure. Always inspect before modifying.
- **Rule**: Read file completely → Understand structure → Make minimal changes.

## Using Lessons

When planning similar work:
1. Check `Memory/lessons.md` for relevant lessons.
2. Apply the future rules to prevent known mistakes.
3. Do not repeat known failures.

When encountering a new problem:
1. Check if a similar lesson exists.
2. Apply the rule if it seems relevant.
3. If different, add a new lesson.

## Reviewing Lessons

Periodically:
1. Review active lessons.
2. Check if any patterns repeat (indicates important lesson).
3. Mark lessons as "Superseded" if a better approach emerges.
4. Consolidate similar lessons into one.