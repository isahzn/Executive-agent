Phase 11 — Integrations, Communication & External Actions

You are now executing Phase 11 of the Executive Agent project.

Phase 10 established the control center, human oversight, task management, approvals, diagnostics, and safe interaction with the agent.

Phase 11 connects the Executive Agent to external services and communication channels, allowing it to perform useful actions outside the local application while maintaining strict safety boundaries.

The objective is to make the Executive Agent genuinely useful in real-world workflows without turning it into an uncontrolled autonomous system.

1. Inspect the current architecture

Before changing anything:

Inspect the entire project.
Read the existing documentation.
Inspect the tool system.
Inspect authentication and permissions.
Inspect the approval system.
Inspect task execution.
Inspect the UI/control center.
Identify integrations that already exist.
Identify which external actions the architecture can safely support.

Do not create duplicate integration systems.

2. Integration architecture

Create a consistent integration architecture.

External services should follow a common pattern where practical:

Integration
├── Authentication
├── Configuration
├── Connection test
├── Available actions
├── Validation
├── Execution
├── Error handling
├── Rate limiting
└── Logging

Each integration should be isolated so that failure of one external service does not crash the entire Executive Agent.

3. Credentials

Design secure credential handling.

Credentials must:

Never be hardcoded.
Never be written into ordinary logs.
Never be unnecessarily exposed to the LLM.
Be encrypted or stored using the safest mechanism available in the current architecture.
Be accessible only to the components that require them.
Be revocable.
Support connection testing.

Sensitive credentials should be masked in the UI.

4. Integration management UI

Extend the control center with an integrations section.

For each integration, display:

Name.
Status.
Connection state.
Required permissions.
Enabled/disabled state.
Last successful connection.
Recent errors.

Provide safe actions such as:

Connect.
Disconnect.
Test connection.
Enable.
Disable.
Reconfigure.
5. Communication capabilities

Where appropriate, support external communication capabilities such as:

Email.
Messaging.
Notifications.
Webhooks.
Calendar actions.

Do not assume every service is available.

Only implement integrations supported by the project's actual environment and credentials.

6. External action framework

Create a standard mechanism for external actions.

An action should define:

Action name.
Description.
Required inputs.
Required credentials.
Risk level.
Whether approval is required.
Execution method.
Expected result.
Failure conditions.

For example:

send_email
├── recipient
├── subject
├── body
├── attachments
├── risk level
└── approval requirement

The agent must validate all required fields before execution.

7. Approval enforcement

External actions must respect the Phase 9 and Phase 10 approval system.

Examples of potentially approval-required actions:

Sending an external message.
Sending an email.
Creating or cancelling appointments.
Publishing content.
Modifying external records.
Making irreversible changes.

The approval requirement must be enforced server-side.

The agent must not bypass approval simply because it has access to the underlying API.

8. Communication drafts

When an external communication requires approval:

Generate the proposed communication.
Display it to the user.
Show the recipient and relevant details.
Allow editing where appropriate.
Request approval.
Send only after approval.
Record the result.

Never silently send a communication when the action is configured to require approval.

9. Webhooks

If useful to the architecture, implement secure webhook support.

Verify:

Authentication/signatures where supported.
Request validation.
Replay protection where appropriate.
Rate limiting.
Payload validation.
Error handling.

Do not trust incoming webhook data blindly.

10. Event-driven execution

Allow external events to trigger tasks where appropriate.

For example:

External Event
      ↓
Webhook/Event Handler
      ↓
Validation
      ↓
Task Creation
      ↓
Agent Planning
      ↓
Approval if required
      ↓
Execution
      ↓
Result

External events must not directly execute arbitrary agent actions without going through the normal task and safety system.

11. Calendar integration

If the architecture supports calendar integrations, allow the agent to work with:

Events.
Availability.
Scheduling.
Rescheduling.
Cancellation.

The agent should understand the difference between:

Reading calendar information.
Proposing a meeting.
Creating a meeting.
Modifying an existing meeting.
Cancelling a meeting.

Higher-risk actions should use approval.

12. Email integration

If email is supported, implement safe operations such as:

Search.
Read.
Draft.
Reply.
Send.
Archive where appropriate.

Clearly distinguish:

Drafting an email

from

Actually sending an email.

Sending must follow the project's approval policy.

Do not expose unrelated emails to the agent.

13. Generic webhook/action support

Where appropriate, create a generic webhook/action mechanism that allows future integrations without rewriting the entire agent architecture.

It should support:

Configurable endpoints.
Authentication.
Headers.
Request validation.
Timeouts.
Retries.
Logging.
Approval requirements.

Do not create a generic system that permits unrestricted arbitrary requests without security controls.

14. Rate limiting

Protect external services and the Executive Agent.

Implement appropriate limits for:

Requests per minute.
Concurrent actions.
Retry counts.
Message sending.
Webhook processing.
Expensive API operations.

Respect external provider rate limits.

15. Failure recovery

External integrations will fail.

Handle:

Timeout.
Rate limit.
Invalid credentials.
Expired credentials.
Service outage.
Invalid request.
Permission denied.
Malformed response.
Network failure.

The agent should:

Detect the failure.
Record useful diagnostic information.
Retry only when safe.
Avoid duplicate external actions.
Mark the task appropriately.
Allow recovery or manual retry.
16. Duplicate-action protection

This is especially important for external actions.

Prevent accidental duplication of operations such as:

Sending the same email twice.
Creating the same calendar event twice.
Creating duplicate records.
Repeating an external transaction.

Where supported, use:

Idempotency keys.
Action IDs.
Task IDs.
Provider-side identifiers.
Execution records.

Do not assume an API automatically prevents duplicates.

17. External action audit trail

Record important external actions.

For each action, store enough information to determine:

Which task triggered it.
Which integration was used.
What type of action occurred.
When it occurred.
Whether approval was required.
Whether approval was granted.
Whether execution succeeded.
Provider response/status.
Whether a retry occurred.

Do not store sensitive data unnecessarily.

18. Agent awareness

Update the agent's tool definitions so it understands:

What integrations exist.
What each integration can do.
What permissions are available.
Which actions require approval.
Which actions are irreversible.
What information is required.

The agent must not claim that an integration is connected when it is not.

19. Human control

The user must be able to:

Disable an integration.
Revoke credentials.
Cancel pending external actions.
Reject approvals.
Inspect action history.
Retry failed actions where safe.

Disabling an integration must actually prevent new actions from using it.

20. Testing

Create tests for:

Integration configuration.
Credential handling.
Connection testing.
Tool invocation.
Authentication failure.
Rate limiting.
Timeout handling.
Invalid input.
External API failure.
Approval enforcement.
Duplicate-action protection.
Webhook validation.
Event-driven task creation.
Action logging.
Integration disabling.
Credential revocation.

Use mocked services where real external services are unavailable.

Do not pretend mocked tests prove that a real provider works.

21. End-to-end testing

Perform realistic workflows.

At minimum test:

Workflow A — Read

External service → Agent → Information → User

Workflow B — Draft

User request → Agent → Draft → User approval/edit

Workflow C — Execute

Approved action → External service → Result → Audit log

Workflow D — Failure

Agent → External service → Failure → Recovery → User notification

Workflow E — External event

Webhook → Validation → Task → Agent → Approval → Action

Fix all issues discovered.

22. Security audit

Review:

Credential storage.
OAuth/token handling.
Webhooks.
External URLs.
Request validation.
SSRF risks.
Authentication.
Authorization.
Rate limits.
Replay attacks.
Injection attacks.
Sensitive logs.
External action permissions.

Do not introduce an unrestricted HTTP request tool simply to simplify integrations.

23. Documentation

Update the documentation with:

Supported integrations.
Required credentials.
Required permissions.
Connection process.
Available actions.
Approval requirements.
Webhook configuration.
Rate limits.
Troubleshooting.
Security considerations.
How to add future integrations.

Only document integrations that actually exist.

24. Final verification

Before completing Phase 11:

Run:

Existing tests.
Integration tests.
Authentication tests.
Authorization tests.
Type checks.
Linting.
Build.
Relevant end-to-end tests.

Verify that existing functionality from Phases 1–10 still works.

Do not sacrifice previous safety mechanisms to enable integrations.

25. Completion report

When Phase 11 is complete, provide:

Integrations

What external services and capabilities were implemented.

External Actions

What the agent can actually do.

Approvals

Which actions require human approval.

Security

How credentials and external actions are protected.

Testing

Which tests were actually performed.

Remaining Issues

Only genuine unresolved issues.

Final Status

Choose:

Complete
Complete With Minor Issues
Not Complete

Do not automatically begin Phase 12.

Stop after Phase 11 and wait for further instructions.