---
title: "Just Train"
tagline: "A workout app for the self-coached athlete — capture, compare, communicate."
role: "Product owner · designer · engineer"
period: "Mar 2026 → present"
status: "Pre-launch"
stack: ["TypeScript", "React", "PWA", "Node", "Postgres"]
links: []
order: 1
version: 2
updated: 2026-09-22
draft: false
---

A workout app for the **self-coached athlete** — the person training hard with nobody watching the numbers. Its whole job is one loop: capture the set, compare it with last time, communicate the progress back to you.

## The move that made it a product

I built it feature-complete in **thirteen days**. Then I stopped — and instead of shipping, I *used* it. Real training data went in, which surfaced affordances I hadn't designed for and bugs I couldn't see from the outside; my own experience as the athlete living in it pushed the UX somewhere better. *Then* I ran the full product pass — personas, a Kano model, user flows, an event storm, bounded contexts, a shared glossary — and rebuilt on that foundation.

The interesting half of this project is the second one. The first half is what you get from momentum; the second is what that same product looks like once a real domain model is underneath it. Seven months, and most of them went here.

## A few decisions worth the name

- **The athlete is the atom; the trainer is a layer.** I started building for trainers and their rosters. Partway through I inverted it — the athlete's own experience is the product, and the trainer is a layer on top. It changed onboarding, the data model, and who the app is *for*.
- **Records are derived, not stored.** A personal best isn't a thing you save; it's a fact you can always recompute from history. Store it and the two eventually disagree. So the history is the only truth, and records fall out of it at read time.
- **Offline is a contract, not a feature.** People log sets in basements with no signal. Offline couldn't be bolted on afterward — every write is built to be safe to replay, so the app is honest whether or not the network is.
- **No AI, no voice, no wearables — said as positioning, not apology.** It's a quiet, fast logger that does one thing without ceremony. Deciding what to *refuse* was as much of the design as deciding what to build.

## The record keeps its reversals

The decision log keeps the calls I got wrong next to the ones I got right — the billing model I chose in June was gone by September; the product still doesn't have a settled name. That's the point, not an embarrassment: the reversals are the evidence the process was real.

**Where it stands:** pre-launch, and being taken to the finish the same way it was rebuilt — decide, then build.
