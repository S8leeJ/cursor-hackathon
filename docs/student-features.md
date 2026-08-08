# SWEnder — SWE-Native Feature Spec

SWEnder is a matching product for SWE/CS students. The metaphor is not a swipe deck. It is a codebase under review: profiles are diffs, interest is a pull request, chemistry is a review thread, and a relationship that works is a merge.

This document replaces the prior student-mode sketch. It defines **MVP first**, then post-MVP SWE mechanics, UI principles (anti–vibe-coded), and **open product questions** that block implementation choices.

**Status:** draft awaiting product answers (see Open Questions). Docs-only on `feat/swe-native-features`.

**Current app (as of `main`):** branded **Token Twin** in the UI; Clerk + Convex; GitHub-only auth; onboarding builds an AI-coding fingerprint (agents / model mix / token burn); `/discover` is a swipe deck (Pass / Like / Super like); matches/messages/profile shells exist; seed users are real UT Austin GitHub profiles. This spec renames the product surface to **SWEnder** and replaces swipe with PR review.

---

## Design thesis

| Dating apps optimize for | SWEnder optimizes for |
|---|---|
| Infinite swipe, low-friction likes | Finite review queue, written rationale |
| Vague chemistry vibes | Public-signal fit (repos, history, intent) + schedule overlap |
| Endless chat limbo | Merge criteria → concrete first meet |
| Silence = ghosting | CI status: Busy / Midterm / Hackathon freeze |
| Social-graph stalking | Private by default; no “who viewed you,” no class rosters |

If a feature could ship unchanged on Tinder with a different skin, it does not belong here.

---

## MVP (ship these)

Ship the PR-as-match loop, identity, campus scope, schedule gate, chat caps, and safety. No reputation scores, no voice prompts, no anonymous crush graphs.

### 1. Identity: `.edu` + GitHub + intent labels

| | |
|---|---|
| **Problem** | Randoms and unclear intent burn the one review slot that matters. |
| **Mechanism** | Verified `.edu` (or campus SSO) plus existing GitHub auth. Required profile fields: **major, year, 3 interests**, and **intent**: `dating` / `friends-first` / `not sure`. Matcher only pairs compatible intents (dating↔dating, friends-first↔friends-first, not-sure↔either). |
| **Fingerprint (keep, reframe)** | Prefer agents / model mix / token burn stay as a **coding fingerprint** on the profile — not a swipe score badge. Shown as structured fields on the PR diff, not as “% twin.” |
| **SWE why** | You would not LGTM a PR without knowing what the author is trying to ship. |

### 2. Same-campus + distance filter

| | |
|---|---|
| **Problem** | “Campus matching” that spans a 40-minute bus ride is not campus. |
| **Mechanism** | Onboarding pins **home campus** (from `.edu` / school). Discovery same-campus by default. Optional max distance (walk/transit bands). Cross-campus only if both opt in. |
| **SWE why** | Merge conflicts get worse with latency. First meets need to fit between classes. |

### 3. Office-Hours Availability (schedule CI)

| | |
|---|---|
| **Problem** | Mutual interest with zero overlapping free blocks dies in the thread. |
| **Mechanism** | Weekly toggles for free blocks (no calendar sync in v1). Matcher requires **≥1 overlapping window this week** before opening a PR in your queue. Overlap shown on the PR card. |
| **Campus note (verified patterns)** | CS courses commonly run **office-hours queues** (sign up, wait, work while waiting) — Stanford CS103 documents this explicitly. Treat “Office Hours” in-product as the availability metaphor students already know, not as a literal TA booking tool. |
| **SWE why** | Reviews that cannot land this sprint should not enter the queue. |

### 4. PR-as-match (replaces swipe) — **mandatory review comment**

This is the core loop. `/discover` becomes an **inbox of open PRs**, not a card stack.

| | |
|---|---|
| **Problem** | Swipe trains zero-signal engagement. Pass/like without language teaches nothing and creates no memory. |
| **Mechanism** | Each candidate arrives as a **Pull Request** against your “life” branch: profile diff (fingerprint, bio, interests, schedule overlap, why-this-PR blurb). Actions: **Accept** (`approve`) or **Deny** (`request changes` / close). **Both Accept and Deny require a written review comment** (min length TBD — see Open Questions). Comment is visible to the other person only on mutual Accept (or always on Deny as a closed-PR note — see Open Questions). |
| **Queue shape** | MVP default: **Weekly Drop** — one curated PR per week (Monday). No browsing the full deck until you resolve this week’s PR. Pass → 90-day cooldown on that person. Accept → opens a chat slot (subject to cap). |
| **Mutual merge** | Match = both sides Accept with review comments. UI language: **Merged**, not “It’s a match ♥.” |
| **SWE why** | Code review works because reviewers must explain themselves. The comment is the product: engagement + signal + anti-ghosting of the decision itself. |

**Review comment UX (MVP):**

- Deny templates (editable): e.g. “Schedule conflict this quarter,” “Intent mismatch,” “Looking for different collaboration energy,” “Not enough overlap in what we’re building toward.” Free-text always allowed; templates are starters, not the only path.
- Accept templates (editable): e.g. “Want to pair on a first meet,” “Fingerprint + schedule look compatible,” “Curious about [shared interest].”
- Empty comment → primary action disabled. No silent Approve/Deny.

### 5. Max 3 open chats (hard WIP limit)

| | |
|---|---|
| **Problem** | Five half-started threads during project season is how ghosting happens. |
| **Mechanism** | Hard cap: **3 open chats**. Chat opens on mutual Accept (merge). To open another, archive/close an existing thread. No upsell. |
| **SWE why** | WIP limits exist so work finishes. Conversations are work. |

### 6. Double-opt-in Date Card → Merge checklist

| | |
|---|---|
| **Problem** | “When are you free?” loops never become a plan. |
| **Mechanism** | Either person proposes a **Date Card** (place, time from shared availability, optional note). Both must Accept. Edits require re-accept. One revision on decline, then back to capped chat pool. Full “post-merge” chat depth can stay light until Date Card lands (product choice — see Open Questions). |
| **SWE why** | Shipping requires an acceptance checklist, not vibes in the comments. |

### 7. First-meet templates (low-stakes environments)

| | |
|---|---|
| **Problem** | Dinner-as-default is too much pressure and money for a first meet. |
| **Mechanism** | Fixed templates: **library study block**, **campus coffee**, **20-min walk**. Time-bounded, public, easy exit (“I have to get back to the pset”). Custom location only after one completed meet. |
| **Campus note** | Prefer real building names per campus in post-MVP place pickers (e.g. Huang / Gates-adjacent study spots at Stanford; campus libraries at UT Austin). MVP uses generic templates so we do not invent building folklore. |
| **SWE why** | First integration tests should be short and reversible. |

### 8. Busy mode (midterm / hackathon freeze)

| | |
|---|---|
| **Problem** | Apps punish silence when you are legitimately underwater. |
| **Mechanism** | Toggle **Busy** with end date (max 14 days). No silence penalties. Hidden from new PRs. Existing threads show: *Busy until [date] — still interested.* Presets: Midterms, Finals, Hackathon. |
| **Campus note (verified)** | **TreeHacks** (Stanford) is a real ~36-hour collegiate hackathon hosted around Huang Engineering Center — sleep-optional, queue-for-everything energy. UT Austin and other schools have analogous hackathon weekends. Busy mode is for those windows, not a joke status. |
| **SWE why** | Red CI is not abandonment; it is “do not merge yet.” |

### 9. Safety: share plan, check-in, block, report

| | |
|---|---|
| **Problem** | First meets with classmates need a safety net, not a live tracker. |
| **Mechanism** | On accepted Date Card: optional **share plan** with one contact (phone/email). One-tap **check-in**. **Block** / **report** everywhere; blocked users never reappear. |
| **SWE why** | Production deploys need a rollback plan. |

### 10. Hide from classmates (anti-outing)

| | |
|---|---|
| **Problem** | Using a dating app in a 30-person lecture is an outing risk. |
| **Mechanism** | Enter **course codes** to hide from. Mutual hide: neither sees the other. No roster display, no “N people from your class are here.” |
| **SWE why** | Private repos exist for a reason. |

### 11. Privacy defaults

| | |
|---|---|
| **Problem** | Small campuses turn social features into gossip engines. |
| **Mechanism** | **Off by default, not in MVP UI:** mutual friends, class rosters, who-viewed-you, public ratings, reputation. Profile visible only to people in your PR queue or after merge. No browse-by-directory. |
| **SWE why** | Least privilege. |

---

## Post-MVP SWE mechanics (after the PR loop retains)

Build only after Weekly Drop + review comments prove stickiness.

| Feature | Metaphor | Notes |
|---|---|---|
| **Commit History as biography** | `git log` | Structured timeline: courses, hackathons, research, clubs, shipped projects — user-authored, not scraped into a stalker dossier. Optional link-outs to public GitHub highlights they choose to pin. |
| **Creative coding / arts track** | gallery PR | Intent or interest tag for generative art, demos, shaders, p5, demoscene-adjacent work. Match on craft overlap without forcing everyone into leetcode identity. |
| **Ethical public-signal forage** | `gh` search, not scrape-stalk | Opt-in: surface **public** GitHub signals the user has already made public (languages, pinned repos, contribution rhythm bands). Strict rules: no private data, no scraping classmates’ non-public socials, no “we found your LinkedIn.” Consent + disclosure in onboarding. |
| **Archives** | tag / release notes | After a meet or a closed PR, optional private archive note (“why I denied,” “what the coffee was like”) — local to the user, not a public reputation score. |
| **Issues & RFCs** | slow courtship | Instead of rapid chat only: open an **Issue** (“propose a walk Thursday”) or a short **RFC** (“what I’m looking for this quarter”) that the other person can comment on. Fits busy CS schedules better than chat velocity contests. |
| **CI checks on merge** | pre-meet gates | Soft checks before Date Card: both Busy-off, both intent-compatible, overlap still valid. Failures are explanatory, not shameful. |
| **ICS / calendar import** | sync Office Hours | Auto-fill availability. |
| **Campus place picker** | real pins | Buildings students actually use — verified per campus, not invented lore. |
| **Second weekly PR** | opt-in | Seniors / job-search bandwidth only; chat cap still 3. |

**Explicitly not building:** emoji reaction stickers as the primary decision UI; required voice notes; public rating of dates; blurred “people from your lab” graphs; anonymous crush reveals; anything that is Tinder with a terminal font.

---

## Divergent theme explorations (product R&D, not MVP scope)

These are lenses for future differentiation. Capture them so we do not default to swipe-with-syntax-highlighting.

1. **History** — Biography as commit history: chronological, annotated, forkable narrative of how someone became the engineer/student they are. Matching on *trajectory*, not just current stack.
2. **Arts** — Creative coding as a first-class identity, not a hobby chip. Critique culture (kind, specific) as the Accept comment norm.
3. **Foraging (ethical)** — Treat the public web like a forest with rules: only fallen fruit (explicitly public, user-consented signals). No doxxing, no dark-pattern enrichment.
4. **Archives** — The app remembers *your* decisions and notes like a lab notebook. Personal archive ≠ social credit.

---

## Anti–vibe-coded UI principles

The current Token Twin surface leans dark-romance (wine/rose glow, floating hearts, “% twin,” swipe orbs). MVP visual direction should reject generic AI-dating purple and romance-slop.

**Prefer**

- **Craft / editorial / terminal:** monospace for metadata and review threads; one strong serif or grotesque for brand; high information density where it helps (diff hunks, checklist), calm whitespace where it doesn’t.
- **PR metaphors done seriously:** status chips (`open` / `approved` / `changes requested` / `merged`), file-tree-like profile sections, comment threads that look like review UI — not stickers on a card.
- **One composition per screen:** inbox → PR detail → merge success. Not a dashboard of promos.
- **Motion with purpose:** comment box focus, status transitions, merge confirmation — not floating hearts and particle glow.

**Avoid**

- Purple-on-white / indigo gradient “AI startup” skins.
- Heart orbs as primary actions; replace with **Approve** / **Request changes** (or Accept / Deny) with keyboard-friendly affordances.
- “% twin” as a gamified score; if similarity exists, show it as **breakdown** (agents overlap, schedule, intent) like a CI matrix.
- Pill forests, emoji persona badges as the hero, glow-heavy dark mode romance unless craft direction explicitly chooses a different dark editorial (terminal green/amber on near-black is fine; wine glow hearts are not the brand).

**Brand**

- Product name in UI: **SWEnder** (resolve Token Twin rename — Open Questions).
- First viewport of marketing: brand-forward, one line of promise, one CTA — no feature salad.

---

## Campus quirkiness (verified vs. open)

Use authentic CS-student life. Do not invent mascots, fake buildings, or fake traditions.

| Pattern | Status | Use in product |
|---|---|---|
| Office hours queues / problem-set crunch | Verified across CS curricula (e.g. Stanford CS103 OH guide) | Availability metaphor; Busy mode |
| Midterms / finals / dead week | Universal | Busy presets |
| TreeHacks @ Stanford (Huang Engineering Center, ~36h) | Verified (Stanford Daily / OSE coverage) | Hackathon Busy preset; post-MVP meet template “hackathon check-in” only if we launch Stanford |
| Seed campus on `main` | UT Austin GitHub profiles | Do not write Stanford-only copy into MVP until campus strategy is decided |
| Fountain hopping, Band Run, etc. | Real Stanford non-CS traditions | Out of scope unless brand expands beyond SWE matching |

**Rule:** campus-specific strings ship behind a campus pack after we pick launch schools.

---

## Fit with current codebase

| Today | MVP change |
|---|---|
| Landing “Token Twin” | Rebrand copy/UI to SWEnder; kill swipe romance chrome |
| `/onboarding` fingerprint quiz | Add `.edu`, major/year/interests, intent, campus, distance, availability |
| `/discover` swipe + `matching.swipe` | PR inbox + Accept/Deny **with required comment**; persist reviews in Convex |
| Mutual like = match | Mutual Accept + comments = **Merged** |
| `/matches` + `/messages` | Enforce 3-chat WIP; Date Card gate (per Open Questions) |
| `lib/swender.ts` personas/emojis | Reframe fingerprint display; drop emoji-led persona as hero |
| Seed UT Austin users | Keep for demos until campus pack exists; label honestly |

---

## Open Questions

*This draft PR awaits user answers before implementation.*

1. **Brand:** Is **SWEnder** the shipped name (retire Token Twin everywhere), or is Token Twin a fingerprint sub-brand?
2. **Queue policy:** Confirm **one Weekly Drop PR** vs. a small rolling review queue (e.g. 3 open PRs max)?
3. **Deny comment visibility:** Does the denied person see the review comment, a redacted reason category only, or nothing beyond “closed”?
4. **Accept comment visibility:** Shown immediately on merge, or after Date Card?
5. **Min comment length / quality:** Characters only, or soft prompts against empty template submits?
6. **Date Card vs. chat:** Is chat fully unlocked on merge, or is Date Card required to unlock long-form messaging?
7. **Launch campus:** Stanford, UT Austin (current seeds), multi-campus from day one?
8. **Fingerprint weight:** Is AI-agent fingerprint still a primary match signal, or secondary to intent + schedule + interests?
9. **GitHub signal in MVP:** Profile link only, or opt-in public pins in v1?
10. **Super-like analogue:** Is there a “request review ASAP” / high-priority PR, or is that anti-thesis to Weekly Drop?
11. **Moderation of review comments:** Blocklist, report-only, or LLM assist for harassment in deny comments?
12. **Rename routes:** `/discover` → `/pulls` or `/inbox`?

---

## Out of scope (reminders)

- Swipe gestures as the primary decision mechanic  
- Reputation / star ratings of people  
- Class roster graphs and “who viewed you”  
- Invented campus lore  
- Vibe-coded purple/romance AI dating UI  

---

*Docs-only. Implementation starts after Open Questions are answered.*
