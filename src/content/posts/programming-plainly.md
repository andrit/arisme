---
title: "Programming, Plainly"
date: 2026-09-12
excerpt: "The words you write to direct an AI aren't notes — they're source code, in plain language. The instrument in that layer is structure: name the things of your work exactly, and the shape of your information becomes the shape of your control."
tags: ["inverted interface", "ai", "natural language"]
draft: false
---

## The medium is language

To speak plainly is to say what you mean in ordinary words — no jargon to hide behind, nothing standing between the thought and the person who hears it. Programming was always the opposite: you had the thought, then you translated it down into a language a machine would accept, and the translation was most of the job. That step is falling away. You now program the way you speak — plainly. That can sound like the old discipline is gone. It isn't; it has moved — out of the syntax and into the words themselves, which now carry the whole weight of what you meant. When you make something with an AI, the thing you actually do — before any code exists, and in between every version of it — is write. You say what you want. You say what *right* means. You say what to change, and why.

And here is the part that's easy to miss: those words don't just *describe* the work, they *perform* it. In older tools, what you typed was a request handed across a counter — it named a result and waited for someone to fetch it. Language aimed at an AI does more than name. One line of it states the intent, sets the machine going, marks off the space of acceptable answers, and steers the next pass. Engineering design has begun to notice the same thing in its own corner of the world, where people now shape physical parts by describing them: language there has stopped being the order slip and become the instrument — the surface the designer acts *through*.

Which means the words deserve a harder name than the one they usually get.

The usual name is notes. Context. A briefing, the kind you'd leave a colleague taking over your desk. That name is wrong, and it's expensive, because if the words are notes you write them the way you write notes — fast, loose, patched when something breaks — and that habit starves the most consequential thing you make.

Those words are source code. When you write what an AI operates from, you are not describing the work to a helper. You are programming it. A programming language is a formal system for specifying behavior: a syntax, a set of meanings, and a runtime that reads the specification and acts. Structured language now meets every part of that. The syntax is prose written in the knowledge that particular phrasings produce particular results. The meanings are settled — not with a compiler's certainty, but by the model's training and by the conventions the instructions themselves establish. The runtime is the AI, and it recompiles the whole thing at the start of every session.

None of this is clever prompting. Linguistics has a word for why language can carry a specification at all — compositionality: the meaning of a whole is built from the meaning of its parts, by the rules of syntax. Every language we ever invented to talk to computers was a narrowed, hardened dialect of the one we already spoke. Narrowing it was a craft of its own — the work of bending human language into a form a machine could take in. We don't have to narrow it anymore.

So the real work sits at the level of the words: not the code the machine emits, but the language you write to direct it — the source it compiles from. And the question that follows is what it takes to write it well.

## The AI is the CAD; your tools are shaped by the words of your ideas

Look at the architecture you're writing into, because it's what "writing it well" gets measured against.

The work happens at two levels. There's the code the machine writes — the TypeScript, the SQL, the shell — the part that actually runs. And there's the direction you write to produce it: the standing rules, the specifications, the briefs, the decisions. The direction is the source; the code is what that source compiles into.

That arrangement has a natural picture: the architect and the CAD system. An architect doesn't lay bricks. They draw the intent at full precision and let the machine turn the drawing into the building. The AI is that CAD — it takes the formal intent and fabricates the artifact from it. The person operates it from a higher floor and inspects the result where it comes back down. The architect was never arguing with the tool. They were authoring, and the tool was rendering.

What that picture leaves implicit is worth making plain: you operate the Software CAD in language. A drafting program hands the architect a tool panel — a pen, a fill, a constraint — and the drawing is only ever as good as the tools they reach for and how they handle them. The Software CAD has a panel too, but its tools are made of words. The vocabulary you bring is the panel you work from, and the interface you get takes its shape from what's on it. And at this level, what's on it is language: the data is your words.

So "write it well" turns out to have a concrete meaning. It isn't eloquence, and it isn't knowing how to write the code itself. It's a question about the panel — what your words are actually made of. And that has a name.

## The instrument is ontology

The tools on the panel are made of words — but not just any words. The instrument is the *structure* of them: the definitions you fix, the names you give the things of your work, the relationships you make explicit. An ontology, in the plain sense — what exists in this domain, what each thing is called, and how the pieces connect. That is the tool you actually pick up.

Watch what changes when the structure is there. Hand the machine a loose, general word and it fills the space you left open — reasonably, plausibly, and not necessarily the way you meant. Hand it a term you've defined — one that names a specific thing, with specific edges, the same way every time — and there is nothing left to fill in. The precision didn't come from the model working harder. It came from you shaping the input until there was only one thing to build.

This is the whole of it, compressed: the shape of your information is the shape of your control. An interface, seen at this level, is the emergence of that shaping — what your structured information becomes when the machine renders it back to you. The output is made by both of you: the model renders, and you shape what it renders from. The lever in your hands is the structure of your language.

## The gulf and the bridge

There is a live debate about whether a model like this *understands* anything — whether there is meaning behind the words or only the statistics of them. The people who study it most carefully will tell you we don't yet have the vocabulary to settle it.

Set the metaphysics aside, because the practical fact is simpler and doesn't wait on the answer. There is a gulf between what the machine takes your words to mean and what you meant by them. That is not a defect to be engineered away. It is the same gulf that sits between any two minds — you never fully transmit what's in your head to another person either.

What differs is the *shape* of this particular gulf. The distance between two people is bridged by a language they both grew up inside, thick with shared assumption no one has to state. The distance between you and the machine is a different one: it has read nearly everything and lived nothing, holds no stake in your project, and won't remember this conversation tomorrow unless you write it down. A vocabulary tuned for the human-to-human crossing doesn't span it.

So you don't try to close the gulf. You build the bridge that fits it — and the bridge is the structure. The defined terms, the ontology, the vocabulary held consistent on purpose: that is what carries meaning reliably across a distance ordinary prose can't. It's why the loose version keeps failing at the edges — a description precise enough for a colleague leaves too much unstated for a machine that shares none of the ground you assumed. The structure isn't bureaucracy. It's the shape of the crossing.

## One word, one meaning

The discipline has a name, and it's older than programming in English. Domain-driven design called it the *ubiquitous language*, and the rule is severe and simple: inside a given boundary of the work, a word means exactly one thing, and everyone — and now everything — uses it that way. Not the analyst's term translated into the engineer's term translated into the code. One term, carried unbroken from the conversation to the specification to the thing that runs.

For a human team that was hygiene — you could limp along without it, on the strength of people quietly reconciling each other's synonyms in the hallway. With an AI in the loop you can't, because the AI does no quiet reconciling. It takes the word you gave it and runs. If *account* means the billing record in one place and the login in another, a person feels the snag and asks which you meant; the machine just picks one and builds on it. So the glossary stops being documentation and becomes a contract — the terms on which meaning crosses between you and the model, binding on both sides.

Held that way, the vocabulary does real work. It's checkable: an inconsistency in the language is now a defect you can catch, the way a type error is — and it happens to be the kind of defect the model itself is good at spotting, so you can hand it your own terms and let it tell you where you've contradicted them. And it compounds: the defined vocabulary is part of what the project carries forward, so every turn inherits the same words meaning the same things. The glossary is law, and the law gets enforced — some of it by you, and more of it, over time, by the machine you handed it to.

## It's still source — so version it

If the words are source, they deserve what source gets. You already version the code the machine emits; version the thing that produced it — the definitions, the rules, the specifications. Diff them, date them, keep their history. Vocabulary drifts, and a change to what a word means is a change to everything built from it, so the change is worth seeing.

There's a strange hole in how software has always been recorded. Git captures everything that was *made* — every change, with an author and a timestamp — and nothing about what was *asked for*. The decision, the brief, the correction that turned the work around: those lived in a chat, a call, a hallway. For a human team that's a nuisance. For an AI it's structural — it has no shared memory to reconstruct intent from, so if the *why* isn't written where the AI reads, the AI can't reach it, and it builds things that are correct and beside the point.

Close that hole and authorship becomes visible on both sides — not just what was built, but what was asked. And a third strand most setups never keep: before it acts, the AI can write down what it *intends* to do. Now three things are on the record — what you asked, what it planned, what it built — and any gap shows up where you can see it, the plan beside the result, instead of hiding in the machine's working memory. The source you write gets a history, the same as the code it compiles into.

## Anyone with something to say

Notice what writing that direction — the language you hand the AI to work from — actually asks of a person. Behavioral rules — how the work should be approached. Definitions of done. The reasons under the decisions, so the machine can choose well at the edges no rule reached. What someone using the thing should feel. None of it requires knowing how to write the code. What it requires is the ability to say what you mean exactly — the skill this whole layer runs on.

That has happened before. In 1977 the architect Christopher Alexander published two hundred and fifty-three patterns for towns and buildings and rooms — each a context, a problem, a resolution, written in plain English held to a fixed and rigorous grammar. The grammar was strict *precisely so that* ordinary language could carry design authority: a person who had never drawn a blueprint could specify the place they wanted to live. A pattern wasn't a suggestion. It was something you could build from.

Writing software in the words you already argue and think in is that move made again. It's worth being plain about what that does and doesn't change. It doesn't make everyone a builder, and precision is its own hard discipline — saying exactly what you mean is not easier than code, only different. But the circle of people who can define a thing precisely, name what *done* means, and hold a line on it is a great deal larger than the circle who can write the code. The layer opens to them.

## The moment of understanding

Everything in this layer comes due at a single moment: the machine hands back what it built, and you read it against what you meant. That moment isn't a checkpoint you clear. It's where understanding actually happens — the point where what you wrote and what the machine made either line up in your mind or come apart. Less a place than an event: the meaning of the work emerging as you see the result against the intent.

Whether a person has to be the one who stands there, and how they hold that line, is a larger argument than this essay makes. What this essay claims is narrower, and comes first: the thing you read against is *language*, and the quality of everything that comes back is decided upstream, in how well the words were shaped. Get that right — the definitions exact, the vocabulary shared, the intent kept in version — and what comes back can only ever be as good as those words. Shape them, and you've shaped everything they become.

