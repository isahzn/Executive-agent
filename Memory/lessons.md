# Memory / Lessons

## Purpose

Records lessons learned from mistakes, failures, or corrections.

### Lesson: Case-Sensitive Directory Operations on Windows
- **Date**: 2026-08-20 | **Importance**: High
- **Problem**: `rm -rf Tmp` also deleted `TMP/` on Windows (case-insensitive filesystem).
- **Cause**: Did not account for case-insensitive filesystem when using bash commands on Windows.
- **Lesson**: On Windows, never assume case differences distinguish directories. Use different names or verify before destructive operations.
- **Future Rule**: When cleaning up directories on Windows, never `rm -rf` a directory that shares a name (case-insensitive) with a directory you want to keep.
