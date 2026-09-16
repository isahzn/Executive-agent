PHASE 07 — AI AGENT SHOWCASE
Purpose

Build the AI Agent showcase experience for the portfolio.

This phase should demonstrate the ability to build AI systems that can reason through tasks, use tools, interact with external systems, maintain context, and complete defined objectives.

The focus is not simply on displaying a chatbot.

The showcase should demonstrate the difference between:

An AI model
An AI assistant
An AI-powered feature
An actual AI agent

The experience should make complex agent systems understandable to nontechnical visitors while providing enough technical depth to demonstrate genuine engineering.

This phase builds on:

MASTER.md
PHASE_00_AUDIT_ARCHITECTURE.md
PHASE_01_HOMEPAGE.md
PHASE_02_MULTIPAGE_ARCHITECTURE.md
PHASE_03_PAST_WORK.md
PHASE_04_PROCESSES.md
PHASE_05_WEBSITE_SHOWCASE.md
PHASE_06_AUTOMATION_SHOWCASE.md

Do not unnecessarily redesign earlier phases.

1. Scope

This phase covers AI-agent-focused projects and demonstrations.

Potential examples include:

Tool-using AI agents
Research agents
Business assistants
Sales agents
Customer-service agents
Document agents
Multi-step task agents
Agent orchestration
Multi-agent systems
AI agents connected to APIs
AI agents connected to automation workflows

Only include capabilities that have actually been implemented.

2. Core Objective

The showcase should answer:

Can Isa build AI systems that actually perform tasks, not just generate text?

The visitor should be able to understand:

What the agent is responsible for
What information it receives
What tools it can use
How it decides what to do
What actions it performs
What result it produces
Where humans remain involved

The agent itself should be the focus.

3. Agent Showcase Structure

A suitable structure is:

Page Header
↓
Featured Agent
↓
Agent Collection
↓
Interactive Agent Demonstration
↓
Agent Architecture
↓
Capabilities / Tools
↓
Safety & Control
↓
CTA

Adjust the structure according to the actual number and complexity of agent systems.

Do not create unnecessary sections simply to make the page longer.

4. Page Header

The header should establish the distinction between automation and agents.

Conceptual direction:

AI AGENTS

Systems that reason through tasks,
use tools, and take controlled actions.

Avoid vague claims such as:

"The future of AI"
"Autonomous intelligence"
"Revolutionary AI"
"Human-level AI"

The page should communicate engineering rather than hype.

5. Featured Agent

If one agent is significantly stronger than the others, feature it prominently.

The featured section may contain:

Agent name
Purpose
Input
Reasoning / planning
Available tools
Actions
Output

[Interact with agent]

The visitor should understand the agent's responsibility before interacting with it.

6. Agent vs Chatbot

Do not label a basic chatbot as an agent simply because it uses an LLM.

A genuine agent demonstration should ideally show one or more of:

Tool usage
Multi-step reasoning
Planning
State/context
External actions
Conditional decisions
Iterative task completion
Structured outputs
Verification
Error recovery

A simple conversational interface can still be useful, but it should be labeled accurately.

7. Agent Data Model

Agent definitions should come from centralized data.

A conceptual structure may include:

{
  id,
  title,
  slug,
  shortDescription,
  description,
  purpose,
  inputs,
  outputs,
  capabilities,
  tools,
  model,
  architecture,
  steps,
  constraints,
  safety,
  demoUrl,
  video,
  featured,
  relatedProject
}

Only implement fields required by the actual application.

Do not hardcode identical agent information across multiple pages.

8. Agent Capabilities

Capabilities may include:

Reasoning
Task decomposition
Planning
Decision making
Classification
Prioritization
Tools
Web search
APIs
Databases
File systems
CRM systems
Messaging systems
Calendar systems
Business software
Output
Reports
Structured data
Messages
Recommendations
Documents
Actions

Only display capabilities the agent actually possesses.

9. Interactive Agent Demo

Where practical, provide a controlled public demonstration.

The visitor may be able to:

Give the agent a task
Watch the agent process the task
See tool usage
See intermediate states where appropriate
Receive the final result

Example:

User task
   ↓
Agent
   ↓
Plan
   ↓
Tool call
   ↓
Tool result
   ↓
Next decision
   ↓
Final output

The demonstration should reveal enough of the process to communicate functionality without exposing private reasoning or internal secrets.

10. Do Not Expose Chain-of-Thought

Do not display private model chain-of-thought or hidden reasoning.

Instead, show safe summaries such as:

Planning task
↓
Checking available information
↓
Calling search tool
↓
Validating result
↓
Preparing response

This communicates the agent's process without exposing hidden internal reasoning.

11. Tool Calls

Tool usage is one of the strongest ways to demonstrate an actual agent.

A tool event can be displayed as:

SEARCH
Query: example query
Status: completed

or:

CRM
Action: create contact
Status: completed

Only display information that is safe for public viewing.

Never expose:

API keys
Authentication headers
Private database records
Access tokens
Private URLs
Internal credentials
12. Tool Architecture

The agent's tools should be represented clearly.

Example:

                 ┌── Search
                 │
Agent ───────────┼── CRM
                 │
                 ├── Database
                 │
                 └── Messaging

The diagram should communicate capability rather than implementation complexity.

Do not create complicated architecture diagrams purely for visual effect.

13. Agent State

If an agent maintains state, explain it clearly.

Possible state includes:

Conversation context
Task state
User preferences
Workflow state
Temporary execution state
Persistent records

Do not claim persistent memory if the system only maintains context for a single interaction.

14. Multi-Agent Systems

If a project uses multiple agents, represent their responsibilities explicitly.

Example:

Orchestrator
      ↓
 ┌────┼────┐
 ↓    ↓    ↓
Sales Marketing Research
Agent  Agent    Agent
      ↓
   Results
      ↓
 Orchestrator

Each agent should have a defined role.

Do not create unnecessary multi-agent architectures.

A single well-designed agent is often preferable to multiple agents performing trivial tasks.

15. Orchestration

Where relevant, explain how an orchestrator coordinates agents.

Potential responsibilities:

Task routing
Agent selection
Context passing
Result aggregation
Verification
Retry
Failure handling
Final response generation

Only show architecture that exists in the actual system.

16. Human Oversight

Agent systems should clearly communicate where human control exists.

Possible controls:

Approval before external actions
Human review
Maximum execution limits
Allowed tool lists
Restricted permissions
Manual cancellation
Escalation
Confidence thresholds

This is especially important when an agent can affect external systems.

17. Agent Permissions

An agent should only have the permissions necessary for its task.

Where relevant, document:

Allowed:
✓ Read project data
✓ Search approved sources
✓ Generate draft

Restricted:
× Delete records
× Access credentials
× Send unrestricted messages

Do not imply that an agent has unrestricted access.

18. Safety

Public demonstrations must be isolated from production systems.

The demo must not allow visitors to:

Delete real data
Modify real customer records
Send uncontrolled messages
Spend money
Access private systems
Trigger expensive infrastructure
Execute arbitrary code
Obtain credentials

Use sandboxed environments and controlled tools.

19. Rate Limits

If the demo invokes a real AI model or external service:

Limit requests
Limit input size
Limit execution time
Prevent abuse
Cache repeat requests where appropriate
Provide sensible failure states

Do not allow the public demo to become an unrestricted API endpoint.

20. Cost Control

AI agents can make multiple model and tool calls.

The showcase should minimize unnecessary operating costs.

Possible techniques:

Small models where sufficient
Cached demo outputs
Fixed demonstration scenarios
Tool-call limits
Token limits
Execution timeouts
Sandbox APIs
Mock external services

The demo should demonstrate capability without becoming unnecessarily expensive to operate.

21. Failure Handling

Agents should not be presented as systems that never fail.

Where appropriate, demonstrate or explain:

Tool failure
Invalid input
Missing information
Model failure
Timeout
Rate limiting
Conflicting information
Human escalation

Example:

Tool unavailable
↓
Agent detects failure
↓
Fallback method
↓
Continue / escalate

Only demonstrate real fallback behavior.

22. Verification

Where an agent performs consequential tasks, verification should be considered.

Possible methods:

Schema validation
Source checking
Output validation
Human approval
Rule-based checks
Tool result verification

Do not imply that generated information is automatically correct.

23. Model Information

Where technically useful, identify the model used.

Examples:

Model
GPT
Claude
DeepSeek
Local model

Only display the actual model used by the demonstration.

Do not imply that the portfolio is model-independent if it relies heavily on a particular provider.

Avoid unnecessary model branding in the primary visual hierarchy.

24. Agent Architecture

A technical architecture section may show:

User
 ↓
Agent Interface
 ↓
Agent Runtime
 ↓
Model
 ↓
Tool Router
 ├── API
 ├── Database
 ├── Search
 └── Automation
 ↓
Result

The architecture must match the actual implementation.

Do not create diagrams that are more sophisticated than the system itself.

25. Prompt Architecture

If prompts are an important part of the agent, describe the structure at a high level.

Possible concepts:

System instructions
Tool definitions
Task context
Structured output
Validation
Memory/context
Guardrails

Do not publish private production prompts or proprietary instructions if they should remain confidential.

26. Agent Output

Outputs should be presented clearly.

Potential formats:

Text
Structured JSON
Tables
Reports
Generated documents
CRM updates
Workflow actions

When showing structured output, format it for readability.

Avoid dumping raw model output into the interface unless that is specifically the point of the demo.

27. Agent Logs

A simplified execution log can communicate technical depth.

Example:

14:32:01  Task received
14:32:02  Planning started
14:32:03  Search tool called
14:32:04  Result received
14:32:05  Output validated
14:32:05  Task completed

Use simulated timestamps only if clearly identified as simulated.

Do not expose private infrastructure logs.

28. Visual Design

Follow the global portfolio design system.

Maintain:

Black
White
Gray
Neutral tones
Strong typography
Technical precision
Editorial composition
Restrained motion

Agent visualizations may use:

Nodes
Lines
Status indicators
Execution timelines
Structured panels

Avoid:

Glowing AI brains
Robot imagery
Neon neural networks
Purple AI gradients
Sci-fi clichés
Excessive glassmorphism
Decorative holograms

The visual language should feel like engineered software, not an AI marketing template.

29. Animation

Useful animation may include:

Tool execution
State transitions
Agent status
Workflow progression
Result generation

Animation should remain:

Fast
Purposeful
Optional
Reduced-motion compatible

Do not animate hidden or meaningless internal processes merely to make the system appear intelligent.

30. Responsive Design

Agent interfaces can become information-dense.

Mobile layouts should intentionally adapt:

Architecture diagrams
Tool lists
Execution logs
Chat interfaces
Status indicators
Long outputs
Tables

Possible strategies:

Vertical diagrams
Collapsible technical details
Scrollable code/output containers
Simplified mobile architecture
Progressive disclosure

Do not allow the desktop interface to simply overflow on mobile.

31. Accessibility

Requirements:

Semantic HTML
Keyboard navigation
Accessible buttons
Visible focus states
Meaningful labels
Accessible status updates
Reduced-motion support
Text alternatives for diagrams

Live agent status updates should not constantly interrupt screen readers.

Use appropriate live-region behavior where needed.

32. Performance

Agent interfaces may contain expensive interactive components.

Requirements:

Lazy-load heavy demos
Avoid unnecessary animation loops
Avoid loading large logs initially
Lazy-load videos
Limit client-side processing
Avoid unnecessary third-party scripts

If the agent runs server-side, do not expose implementation credentials to the browser.

33. Security

Agent systems can have significantly higher security requirements than normal portfolio pages.

Never expose:

API keys
Tool credentials
Database passwords
Access tokens
Private prompts
Private customer information
Internal service URLs
Server environment variables

Tool access must be explicitly constrained.

Do not allow user input to become unrestricted executable instructions.

34. Data Privacy

Use only safe demonstration data.

Do not expose:

Real customer information
Private conversations
Personal addresses
Private business documents
Internal company data
Authentication information

If real project data is required for a demonstration, anonymize it appropriately.

35. Agent vs Automation Relationship

The portfolio should clearly distinguish these concepts.

Automation

A predefined workflow:

Trigger
→ Step
→ Condition
→ Action
AI Agent

A system that can determine the steps needed to accomplish a defined objective using available tools and constraints.

Example:

Objective
↓
Agent determines approach
↓
Uses available tools
↓
Evaluates results
↓
Takes next action
↓
Produces result

This distinction should be reflected in the portfolio's information architecture.

36. Project Integration

Agent projects should connect to the broader project system.

Where applicable, an agent can link to:

/work/project-slug
Automation demonstrations
Process explanations
Related website projects

This allows visitors to move from:

What was built?
↓
How was it built?
↓
What does the agent do?

without duplicating content.

37. Empty States

If there are not enough genuine AI-agent projects, do not fabricate them.

The page should gracefully support:

One agent
Several agents
One interactive demo
Video-only demonstration
Architecture-only demonstration
No public live agent

A small number of credible demonstrations is better than a large collection of superficial "agents."

38. CTA

The final CTA should connect agent capabilities to potential projects.

Conceptual direction:

Need a system that can handle
more than a fixed workflow?

Start a Project →

Keep the CTA consistent with the rest of the portfolio.

39. Do Not Implement

This phase should NOT unnecessarily implement:

Fully autonomous production agents
Unrestricted agents
Real-world financial actions
Uncontrolled messaging
Arbitrary code execution
Production customer data access
Complex multi-agent architecture without a real use case
Fake agent reasoning
Fake tool calls
Fake performance metrics

Do not build dangerous or expensive functionality merely to make the portfolio appear more advanced.

40. Acceptance Criteria

Phase 07 is complete when:

Showcase

AI Agent showcase exists

Purpose is immediately clear

Real agent projects/demos are represented

Strongest agent receives appropriate emphasis

Agent functionality is understandable

Agent Definition

Agent purpose is clear

Inputs are explained

Outputs are explained

Tools are identified

Capabilities are accurate

Agent and chatbot are not incorrectly conflated

Demonstrations

Interactive demo works where implemented

Demo environment is isolated

Tool usage is understandable

Demo cannot access private systems

Rate limits exist where required

Failure states are handled

Architecture

Agent architecture is accurately represented

Tool relationships are clear

Multi-agent architecture is only used when genuine

Shared agent data is used

Related projects can be linked

Safety

No private credentials are exposed

No production secrets are exposed

No private customer data is exposed

Agent permissions are controlled

Public input cannot cause dangerous actions

Expensive operations are appropriately limited

AI

AI capabilities are accurately described

Model information is accurate where shown

No fabricated reasoning is presented

Private chain-of-thought is not exposed

Safe execution summaries are used instead

Design

Global design system is preserved

No generic AI-slop aesthetic

No robot/brain/neural-network clichés

No neon AI interface

No excessive gradients

Architecture visuals remain restrained and technical

Responsive

Agent interface works on mobile

Architecture diagrams adapt

Logs remain readable

Outputs do not break the layout

No unwanted horizontal page overflow

Accessibility

Keyboard navigation works

Focus states are visible

Status changes are accessible

Diagrams have text alternatives

Reduced motion works

Interactive controls have accessible labels

Performance

Heavy demos are lazy-loaded

Videos are optimized

Client-side processing is controlled

Animations are efficient

Third-party scripts are minimized

Technical

Production build succeeds

No critical console errors

No broken routes

No secrets are exposed

No fake agent capabilities remain

Public demos remain safe and controlled

41. Final Rule

The AI Agent Showcase exists to answer:

Can Isa build an AI system that can actually perform a defined task using tools and controlled actions?

Do not sell intelligence with animations.

Show the objective.

Show the available tools.

Show the execution.

Show the result.

Show the architecture when useful.

Keep humans in control of consequential actions.

An agent is demonstrated by what it can reliably do, not by how futuristic its interface looks.