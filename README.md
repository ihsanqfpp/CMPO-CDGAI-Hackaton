# CDGAI — Frontend (Operator Dashboard)

Next.js (App Router) + TypeScript dashboard for the CDGAI multi-agent system.
Renders the agent network as connected glowing nodes (Maryam centered, MCP /
A2A / AG-UI lanes labeled), a live team-conversation panel, the approval
console, Hamza's performance panel, and a streaming activity feed.

## Run locally

```bash
npm install
cp .env.local.example .env.local     # set NEXT_PUBLIC_API_BASE to the backend
npm run dev                          # http://localhost:3000
```

The backend (FastAPI agent runtime) must be running — default
`NEXT_PUBLIC_API_BASE=http://localhost:8000`.

## How it works

- `hooks/useAgui.ts` subscribes to the backend AG-UI SSE stream and derives the
  activity feed, per-agent status, pending approvals, team chat, and mode.
- `components/NetworkView.tsx` draws the org graph with reactflow.
- `components/ChatPanel.tsx` shows the Maryam-driven conversation — the operator
  assigns an objective; Maryam asks the team and they reply for real. Each
  message shows who is speaking and to whom, plus which model (Claude/Gemini)
  served it.
- `components/ApprovalConsole.tsx` handles human-in-the-loop approvals.

## Deploy (Vercel)

Set `NEXT_PUBLIC_API_BASE` to the deployed backend URL in the Vercel project,
then deploy as a standard Next.js app.
