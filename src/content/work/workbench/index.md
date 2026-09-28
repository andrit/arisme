---
title: "AI Dev Workbench"
tagline: "A self-hosted harness where the AI writes the software and the human decides at the gate — built by one person, with the operator it was building."
role: "Designer · operator · sole engineer"
period: "May 2026 → present"
status: "In daily use — every other project on this page was built inside it"
stack: ["Docker", "TypeScript", "Fastify", "Postgres + pgvector", "MCP", "Claude Code"]
links: []
order: 2
version: 3
updated: 2026-09-23
draft: false
---

## What it is

A development environment with the usual roles reversed. The AI operator writes the code; the human — the *designer* — gives direction at the level of ideas, reads what came back, and decides at each gate whether it advances. It's a *harness* — the tools, permissions, memory, tests and guardrails around a model that make it reliable — built for one operator working across many projects, self-hosted on a laptop. Every other project on this page was built inside it. So was the workbench itself.

## The work wasn't building it — it was governing it

The capability isn't the interesting part. When the record starts, the environment already worked and was in daily use. The months since are the story of making a working tool *governable*: giving a pile of capability a lifecycle, a memory the operator writes to itself between sessions, and gates that actually mean something. That last one turned out to be the hard one.

## What was actually hard

Not the primitives. Hooks, session memory, skills, budgets, task plans — every one has shipped from some vendor or library in the past year, and each took days here, not weeks. What took months was the part nobody publishes: **making the gates real.** Almost every check the environment added — advance criteria, readiness, is-the-deliverable-there — was later found to have a failing state that had never once occurred. A check that cannot fail isn't a gate; it's a status line. Most of the later work was the hunt for checks that can actually say no.

## The rules came from losses, not reviews

The workbench is a registered project inside itself, so every defect in the harness is found by the harness's own sessions — which is why its hardest rules read like scar tissue:

- **You may version, but you may not destroy.** After a session overwrote its own handover on the claim that its deferred items were finished — they weren't — the rule came to govern every store the operator can touch: memory, files, rows, documents. Nothing is replaced without preserving what was there first.
- **Read the documents to navigate; open the files to conclude.** More than once the operator built on a design doc that asserted something the code didn't have. Documents are claims, not evidence — and it cuts both ways: heavy documentation earns no more trust, and no more suspicion, than none.

## Where it sits

The big labs now build their software with their own coding agents — a team shipping a million lines with almost none typed by hand; a coding agent built by its own coding agent. This is the single-operator version of that practice, with one difference held on purpose: **the human gate is the resting state of the system, not a checkpoint bolted onto an agent that would otherwise run unattended.** The reasoning for that choice is in [The Inverted Interface](/writing/the-inverted-interface).
