Agentic Concierge: A multi-agent e-commerce protocol that transforms static checkouts into dynamic, conversational settlements. Built for the Pine Labs Playground AI Hackathon


The Problem:
Static pricing and rigid payment terms cause massive cart abandonment. When a user hesitates at checkout, there is currently no digital mechanism to "save the sale" through real-time negotiation or personalized concessions.


The Solution:
We’ve built a three-agent relay that handles the entire lifecycle of a purchase:
1. Discovery Agent: A domain expert (e.g., Decathlon trekking guide) that matches user intent to technical specs.
2. Sales Agent (USP): Initiates Agent-to-Agent (A2A) Negotiation. It pits a "Buyer Agent" against a "Merchant Agent" to find a consensus on price or EMI terms within safe margin guardrails.
3. Payment Agent: Executes the final "consensus payload" via Pine Labs payment rails.


Tech Stack & Implementation

>> LLM Orchestration: Powered by AWS Bedrock (Claude Sonnet). We used a multi-persona system prompt architecture to handle agent hand-offs.

>> A2A (Agent-to-Agent) Protocol: Agents communicate via a structured JSON Schema to reach a "consensus" state.

>> Real-time Observability: Built a Socket.io bridge to stream the "Agent Thinking" (Chain-of-Thought) from Bedrock directly to a frontend terminal, providing 100% transparency into the negotiation logic.

>> Payments: Integrated Pine Labs Online APIs to generate dynamic payment links where the amount and emi_tenure are injected programmatically post-negotiation.


Impact that our tool creates:
This moves Pine Labs from a passive payment pipe to an active conversion engine, enabling "Agentic Commerce" where the payment rail itself facilitates the closing of the deal.
