# Recycle Bin Entry — 2026-08-20

## What was moved/lost

- Original phase files from `Tmp/phases/` (Phase 1 through Phase 7)
- These were the user's phase instruction files

## Why

Accidental deletion during directory restructuring. The `Tmp` and `TMP` directories are the same on Windows (case-insensitive filesystem), so `rm -rf Tmp` also removed `TMP/Phases/` where the files had been moved.

## Recovery

The phase files need to be restored by the user. Phase 1 content was fully read and can be recreated from memory. Phases 2-7 were not read in full during this session.
