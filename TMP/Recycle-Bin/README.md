# TMP / Recycle-Bin

## Purpose

A safe temporary holding area for files, folders, generated artifacts, outdated versions, experiments, and other material that is no longer needed in the active workspace but should not yet be permanently deleted.

## Rules

### First choice — Move, don't delete

When something appears unnecessary, move it into `TMP/Recycle-Bin/` instead of permanently deleting it.

### Never permanently delete important work without explicit permission

The recycle bin preserves enough information to understand:
- What was moved
- When it was moved
- Why it was moved
- Where it originally came from

### Structure

Recycled items are organized by date:

```
TMP/Recycle-Bin/
├── 2026-08-20/
│   ├── old-file/
│   └── metadata.md
```

### Metadata

When moving items, create a `metadata.md` in the same date folder that records:
- Original file path
- Reason for moving
- Date moved
- Any relevant context
