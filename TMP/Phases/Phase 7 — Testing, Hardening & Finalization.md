Phase 7 — Testing, Hardening & Finalization

You are now executing Phase 7 of the Executive Agent project.

Your job is to take the entire system built during Phases 1–6 and make it reliable, clean, maintainable, and ready for real-world use.

1. Read the project first

Before changing anything:

Inspect the entire project structure.
Read the relevant documentation and configuration.
Review the previous phase files and their completed work.
Understand the current architecture before making modifications.
Do not blindly rewrite existing systems.
Preserve working functionality.

If something from an earlier phase is incomplete or broken, fix it before continuing.

2. Full-system audit

Audit the entire Executive Agent for:

Broken functionality
Missing functionality
Incorrect imports
Dead code
Duplicate code
Bad error handling
Hardcoded values that should be configurable
Security problems
Race conditions
Infinite loops
Unhandled exceptions
Bad file management
Incorrect permissions
Unnecessary dependencies
Poor database handling
API failures
Tool failures
Agent-state problems
Context/memory problems
Incorrect assumptions about the filesystem
Problems caused by restarting the application

Do not merely report problems. Fix them where possible.

3. Agent reliability

The Executive Agent must behave predictably.

Verify that it:

Understands its available tools.
Uses tools only when appropriate.
Does not fabricate tool results.
Handles tool failures gracefully.
Does not repeatedly perform the same failed action.
Can recover from interrupted tasks.
Maintains task state correctly.
Does not lose important context.
Does not modify unrelated files.
Does not destroy user data.
Can distinguish temporary files from important files.
Can safely retry recoverable operations.
Stops when a task cannot safely continue.
4. Filesystem safety

Pay particular attention to the filesystem.

The agent must:

Avoid accidental deletion.
Prefer moving unwanted files to the recycle-bin/temporary system rather than permanently deleting them.
Keep temporary artifacts isolated.
Avoid leaving random files throughout the project.
Clean up temporary files after successful operations.
Preserve important project files.
Never overwrite important files without appropriate safeguards.

If the project already contains a recycle-bin or temporary-folder system, improve it rather than creating a competing system.

5. Security audit

Check for:

API keys accidentally stored in source code.
Secrets committed to the repository.
Unsafe shell execution.
Arbitrary command execution.
Path traversal.
Unsafe file operations.
Unvalidated user input.
Exposed internal errors.
Missing authentication/authorization where required.
Dangerous tool permissions.
Excessive agent permissions.

Fix vulnerabilities that can be safely fixed within the project's architecture.

Never replace a security mechanism with a weaker shortcut simply to make a test pass.

6. Error handling

Every major subsystem should fail gracefully.

For each important operation:

Detect failure.
Capture useful diagnostic information.
Give the agent enough information to recover.
Retry only when retrying is safe.
Stop after reasonable retry limits.
Preserve the current task state.
Avoid corrupting files or data.

Errors should be understandable to both the developer and the agent.

7. Testing

Create or improve automated tests where practical.

Test at minimum:

Core agent execution.
Tool execution.
Tool failures.
File creation.
File modification.
File movement.
Temporary-file cleanup.
Recycle-bin behavior.
Configuration loading.
Environment variables.
State persistence.
Restart/recovery behavior.
Invalid input.
Missing files.
Missing configuration.
API failures.

Do not create meaningless tests that only test implementation details.

Tests should verify actual behavior.

8. End-to-end test

Perform a realistic end-to-end test of the Executive Agent.

Give it a representative task that requires multiple steps and verify:

It understands the objective.
It plans correctly.
It uses the correct tools.
It creates/modifies the correct files.
It keeps temporary files isolated.
It handles failures.
It completes the task.
It leaves the project clean.

Fix every failure discovered during this test.

9. Performance and resource usage

Look for unnecessary:

API calls
LLM calls
File reads
File writes
Database operations
Repeated calculations
Context loading
Tool calls

Optimize obvious inefficiencies without making the architecture unnecessarily complicated.

The goal is efficient and reliable, not maximally complex.

10. Documentation

Update the project documentation so that a developer can understand:

What the Executive Agent does.
Project architecture.
How to install it.
How to configure it.
Environment variables.
Available tools.
Agent workflow.
File-management rules.
Temporary/recycle-bin behavior.
How to run tests.
How to start the system.
How to troubleshoot common failures.
How future developers should extend it.

Do not document functionality that does not actually exist.

11. Cleanup

After testing:

Remove unnecessary files.
Remove dead code.
Remove obsolete temporary artifacts.
Move junk into the appropriate temporary/recycle-bin location.
Remove unused dependencies where safe.
Keep the repository organized.
Do not delete anything important merely because it looks unused.
12. Final verification

Before declaring Phase 7 complete:

Run the project's available:

Tests
Type checks
Linters
Build process
Relevant validation scripts

Fix failures instead of ignoring them.

Then perform one final inspection of the project.

13. Completion report

When Phase 7 is complete, provide a concise report containing:

Completed

What was fixed, improved, tested, and finalized.

Tests

Which tests/checks were run and their results.

Remaining Issues

Only genuine issues that could not safely be resolved.

Project Status

State whether the Executive Agent is:

Ready
Mostly ready
Not ready

Do not claim something works unless you actually verified it.

Important rules
Do not skip investigation.
Do not rewrite working architecture unnecessarily.
Do not create duplicate systems.
Do not delete important files.
Do not hide errors.
Do not claim tests passed when they were not run.
Do not move to another phase automatically.
Phase 7 is the final phase unless the user explicitly creates another phase.

When everything is complete, stop and wait for further instructions.