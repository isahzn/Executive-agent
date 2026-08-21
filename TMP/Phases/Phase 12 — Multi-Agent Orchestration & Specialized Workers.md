Phase 12 — Multi-Agent Orchestration & Specialized Workers

You are now executing Phase 12 of the Executive Agent project.

Phase 11 connected the Executive Agent to external services and communication channels. Phase 12 introduces specialized worker agents that can perform focused subtasks under the control of the main Executive Agent.

The Executive Agent remains the orchestrator and authority. Worker agents must not independently bypass the project's security, approval, filesystem, memory, or task-management systems.

1. Inspect the existing architecture

Before changing anything:

Inspect the complete project.
Read all relevant documentation.
Inspect the main agent loop.
Inspect task planning.
Inspect tool execution.
Inspect memory.
Inspect approvals.
Inspect integrations.
Inspect the UI/control center.
Determine whether any multi-agent functionality already exists.

Do not create a second orchestration system.

2. Define the agent hierarchy

Establish a clear hierarchy:

Executive Agent
       │
       ├── Planner
       │
       ├── Research Worker
       │
       ├── Coding Worker
       │
       ├── Analysis Worker
       │
       ├── File/Document Worker
       │
       └── Other Specialized Workers

The exact workers should depend on the actual project.

Do not create workers merely because the architecture allows them.

3. Executive Agent responsibilities

The Executive Agent remains responsible for:

Understanding the user's objective.
Creating the overall plan.
Deciding whether delegation is useful.
Assigning work.
Providing relevant context.
Monitoring workers.
Reviewing results.
Resolving conflicts.
Performing final verification.
Reporting the final result to the user.

Workers should not replace the Executive Agent.

4. Worker responsibilities

Each worker should have:

A clear purpose.
A limited tool set.
Defined inputs.
Defined outputs.
Defined permissions.
Defined failure behavior.
Defined completion criteria.

A worker should not perform unrelated tasks simply because it has access to a tool.

5. Worker task protocol

Create a standard worker-task format.

For example:

Worker Task
├── task_id
├── parent_task_id
├── objective
├── context
├── constraints
├── allowed_tools
├── expected_output
├── completion_criteria
├── timeout
└── risk_level

Use the project's existing task/state architecture if possible.

6. Delegation

The Executive Agent should determine:

Whether a task benefits from delegation.
Which worker is appropriate.
What information the worker needs.
What information should not be provided.
Whether the worker needs external tools.
Whether the worker needs approval.

Avoid delegation when it adds more overhead than value.

7. Context isolation

Workers should receive only the context required for their assigned task.

Do not automatically provide:

Entire conversation history.
Entire memory database.
All project files.
All credentials.
All tool access.

Use least-privilege context.

8. Tool isolation

Each worker should have only the tools it requires.

For example:

Research Worker
→ Search / retrieval tools


Coding Worker
→ File tools / development tools


Document Worker
→ Document processing tools

Do not give every worker unrestricted access to every tool.

9. Worker permissions

Workers must inherit the system's existing safety rules.

They must respect:

Filesystem protections.
Recycle-bin rules.
Authentication.
Authorization.
Approval requirements.
External-action restrictions.
Rate limits.
Resource limits.

A worker must never bypass a restriction simply because it is operating under the Executive Agent.

10. Worker communication

Create a controlled communication mechanism between:

Executive Agent → Worker.
Worker → Executive Agent.
Worker → Worker where genuinely necessary.

Prefer structured messages rather than unrestricted shared context.

Worker responses should contain:

Status
Result
Evidence
Problems
Recommendations
Files changed
Actions performed
11. Worker completion verification

The Executive Agent must not blindly trust worker output.

After a worker reports completion:

Inspect the result.
Verify expected outputs.
Check files or external effects where appropriate.
Compare against completion criteria.
Reject or retry incomplete work.
Accept the result only when verification succeeds.
12. Parallel execution

Support parallel workers only when tasks are independent.

For example:

             Executive
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
    Research   Analysis  Research
        │        │        │
        └────────┼────────┘
                 ↓
             Synthesis

Do not parallelize tasks that can interfere with one another.

13. Dependency management

If one worker depends on another worker:

Worker A
   ↓
Worker B
   ↓
Worker C

The orchestration system must understand the dependency.

Do not start dependent work prematurely.

14. Conflict resolution

Workers may produce conflicting results.

The Executive Agent should:

Detect conflicts.
Compare evidence.
Determine whether another worker should verify the issue.
Resolve the conflict.
Record the final decision.

Never merge contradictory outputs blindly.

15. Failure handling

If a worker fails:

Record the failure.
Determine whether it is recoverable.
Retry when appropriate.
Try a different worker if useful.
Re-plan if necessary.
Escalate to the user when the task cannot safely continue.

Prevent failed workers from creating infinite retry loops.

16. Worker timeouts

Each worker should have reasonable limits for:

Execution time.
Tool calls.
API calls.
Memory/context size.
Retries.

When a worker exceeds a limit:

Stop it safely.
Preserve useful state.
Report the failure.
Allow the Executive Agent to decide what to do next.
17. Worker lifecycle

Define a worker lifecycle such as:

Created
   ↓
Queued
   ↓
Running
   ↓
Waiting
   ↓
Completed

With failure paths:

Running → Failed
Running → Cancelled
Waiting → Cancelled

Persist important worker state.

18. Cancellation

The user must be able to cancel a parent task.

When a parent task is cancelled:

Stop new workers from being created.
Request cancellation of active workers.
Stop pending worker tasks.
Preserve relevant logs.
Prevent workers from continuing external actions.

Do not assume cancellation is instantaneous for external APIs.

19. Resource management

Prevent uncontrolled worker creation.

Implement limits for:

Maximum concurrent workers.
Maximum workers per parent task.
Maximum nested delegation depth.
Maximum total worker execution time.
Maximum worker API usage.

Avoid recursive agent spawning.

A worker must not automatically create unlimited child agents.

20. Memory interaction

Workers may need memory, but memory access must remain controlled.

Prefer:

Executive Agent
      ↓
Relevant memory
      ↓
Worker

rather than giving every worker unrestricted access to long-term memory.

Workers should return useful information to the Executive Agent when appropriate.

Do not automatically save every worker output as permanent memory.

21. Multi-agent UI

Extend the control center to show:

Active workers.
Worker status.
Parent task.
Worker objective.
Progress.
Failures.
Completed results.
Resource usage where available.

Allow the user to inspect worker activity without exposing unnecessary internal reasoning.

22. Worker management

Provide safe administrative controls for:

Enabling/disabling worker types.
Configuring worker limits.
Viewing worker history.
Cancelling workers.
Inspecting worker failures.

Do not allow unsafe permission escalation through the UI.

23. Audit trail

For each worker execution, record:

Parent task.
Worker type.
Start time.
End time.
Status.
Tools used.
Files changed.
External actions performed.
Approval events.
Result.
Failure information.

Do not store unnecessary sensitive information.

24. Testing

Create tests for:

Worker creation.
Worker delegation.
Worker permissions.
Context isolation.
Tool isolation.
Worker completion.
Worker failure.
Retry behavior.
Timeout.
Cancellation.
Parallel workers.
Dependency handling.
Conflicting results.
Parent-task cancellation.
Worker limits.
Nested delegation protection.
Audit logging.
25. End-to-end testing

Perform realistic multi-agent workflows.

Test A — Simple delegation

User → Executive Agent → Worker → Result → Executive Agent → User

Test B — Parallel workers

User → Executive Agent → Multiple independent workers → Synthesis → Result

Test C — Failure

Executive Agent → Worker → Failure → Retry/re-plan → Result

Test D — Cancellation

User → Executive Agent → Workers → User cancellation → All workers safely stop

Test E — External action

Executive Agent → Worker → Proposed external action → Approval → Execution → Verification

Test F — Conflict

Worker A → Result A
Worker B → Conflicting Result B
→ Executive Agent verifies → Final result

Fix every discovered problem.

26. Security audit

Pay particular attention to:

Worker privilege escalation.
Context leakage.
Credential leakage.
Tool access.
Filesystem access.
External actions.
Prompt injection through worker-generated content.
Untrusted worker output.
Recursive agent creation.
Cross-task data leakage.

Treat worker output as untrusted until verified.

27. Performance

Measure whether multi-agent execution actually improves performance.

Watch for:

Excessive LLM calls.
Duplicate research.
Duplicate file reads.
Unnecessary worker creation.
Excessive context transfer.
Worker synchronization overhead.

If a single agent can complete a task more efficiently, allow the Executive Agent to avoid delegation.

28. Documentation

Update documentation with:

Agent hierarchy.
Available workers.
Worker responsibilities.
Delegation rules.
Worker permissions.
Context isolation.
Worker lifecycle.
Failure handling.
Cancellation.
Parallel execution.
Resource limits.
Security model.
Multi-agent troubleshooting.

Document only functionality that actually exists.

29. Final verification

Before completing Phase 12:

Run:

Existing tests.
Worker tests.
Integration tests.
Security tests.
Type checks.
Linting.
Build.
End-to-end multi-agent tests.

Verify that Phases 1–11 continue working.

Do not allow multi-agent functionality to weaken existing safety mechanisms.

30. Completion report

When Phase 12 is complete, provide:

Workers

Which specialized workers were implemented.

Orchestration

How the Executive Agent delegates and coordinates work.

Safety

How permissions, context, approvals, and resource limits are enforced.

Testing

Which multi-agent tests were actually performed.

Performance

Whether delegation improved or degraded performance.

Remaining Issues

Only genuine unresolved issues.

Final Status

Choose:

Complete
Complete With Minor Issues
Not Complete

Do not automatically begin Phase 13.

Stop after Phase 12 and wait for further instructions.