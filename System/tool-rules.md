# System / Tool Rules

## Purpose

Defines how Freebuff uses tools and how agents and skills relate to tools.

---

## Tool Hierarchy

```text
Freebuff (Executive) controls tool permissions
    ↓
Agents may prefer tools, but do not grant permission
    ↓
Skills may recommend tools, but do not grant permission
```

Agent preference for a tool does not grant permission to use it. Tool access remains controlled by Freebuff's permission and security system.

---

## General Rules

1. Read before editing.
2. Batch independent operations.
3. Prefer minimal changes.
4. Verify after changes.
5. Use the right tool for the task.

---

## Tool-Specific Guidelines

### File Operations
- `read_files` to inspect before editing.
- `str_replace` for targeted edits.
- `write_file` for new files or full rewrites.
- `list_directory` and `glob` for discovery.

### Code Search
- `code_search` for patterns, references, definitions.
- `glob` for files by name pattern.

### Terminal
- Build, test, typecheck, git, file system operations.
- POSIX syntax (bash).
- Prefer non-destructive commands.
- Ask before destructive operations.

### Web Search
- `web_search` for current information.
- `read_url` to fetch and extract content.
- Verify before recommending third-party services.

---

## Skill Scripts

If a skill contains scripts: inspect before use, understand what they do, respect Plan Mode and approval, do not execute destructive scripts without authorization, verify output. A script inside a skill does not bypass Freebuff's permission system.
