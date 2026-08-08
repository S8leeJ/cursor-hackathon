# SWEnder Student Features

SWEnder is for students who have real schedules. Swipe apps optimize engagement; they fail anyone with labs, midterms, and a 20-minute walk between buildings. This doc defines what we ship first and what waits.

**Current app:** landing, persona onboarding (`/onboarding`, `/wrapped`), demo swipe (`/discover`), matches/messages/profile, Convex + Clerk. Student mode replaces infinite swipe with one intro/week and hard chat limits.

---

## MVP

Ship these. No voice prompts, no reputation scores, no social-graph gimmicks.

### 1. `.edu` verify + basic profile + intent labels

| | |
|---|---|
| **Problem** | Randoms on campus apps; profiles that don't say what you want. |
| **Mechanism** | Verified `.edu` (or campus SSO). Required: **major, year, 3 interests**. Required **intent label**: `dating` / `friends-first` / `not sure`. Matcher only pairs compatible intents (dating↔dating, friends-first↔friends-first, not-sure↔either). |
| **Student why** | You need to know if someone wants a date or a study buddy before you waste a weekly intro slot. |

### 2. Same-campus + distance filter

| | |
|---|---|
| **Problem** | "Campus dating" apps match you with someone a 40-minute bus ride away. |
| **Mechanism** | Onboarding pins **home campus** (or primary `.edu`). Discovery scoped to same campus by default. Optional **max distance** slider (e.g. 10 / 20 / 30 min walk or transit). Cross-campus only if both opt in. |
| **Student why** | Commute is real. A match you can't meet between classes isn't a match. |

### 3. Office-Hours Availability

| | |
|---|---|
| **Problem** | You matched; neither of you is free this week. Thread dies. |
| **Mechanism** | Simple **weekly toggles** — mark blocks when you're generally free (no calendar sync required for v1). Matcher requires **≥1 overlapping window this week** before surfacing an intro. Show the overlap on the intro card. |
| **Student why** | CS schedules are chunks, not evenings. Filter on overlap or don't bother. |

### 4. Weekly Drop (one intro/week)

| | |
|---|---|
| **Problem** | Infinite swipe trains distraction; students won't check daily. |
| **Mechanism** | Every Monday: **one curated intro** with a short **why** (intent match, schedule overlap, shared interest). Accept → uses a chat slot. Pass → 90-day cooldown. No browsing until you act on this week's intro. |
| **Student why** | One decent option beats fifty maybes. Treat it like a friend setting you up, not a slot machine. |

### 5. Max 3 open chats (hard cap)

| | |
|---|---|
| **Problem** | Five half-started threads during finals is how ghosting happens. |
| **Mechanism** | **Hard cap: 3 open chats.** A chat opens on mutual accept of a Weekly Drop or first reply after Date Card unlock. To start a new one, **close or archive** an existing chat. No exceptions, no upsell. |
| **Student why** | You cannot sustain more than three conversations during project season. The app shouldn't pretend you can. |

### 6. Double-Opt-In Date Card

| | |
|---|---|
| **Problem** | "When are you free?" loops that never become a plan. |
| **Mechanism** | Either person sends a **Date Card**: place, time (from shared availability), optional note. **Both must accept** before full chat unlocks. Edits to time/place require re-accept. One revision on decline, then back to capped chat pool. |
| **Student why** | Forces a concrete plan both people already signed off on. No vague interest, no endless scheduling ping-pong. |

### 7. First-meet templates

| | |
|---|---|
| **Problem** | "Dinner?" on a first meet is too much pressure and money. |
| **Mechanism** | Date Card pulls from fixed templates: **library study block**, **campus coffee**, **20-min walk**. Time-bounded, public, low stakes. Custom location only after one completed meet. |
| **Student why** | Gives you a script. Easy exit built in ("I have to get back to the problem set"). |

### 8. Busy mode (midterm / hackathon)

| | |
|---|---|
| **Problem** | Apps punish silence when you're legitimately underwater for 72 hours. |
| **Mechanism** | Toggle **Busy mode** with end date (max 14 days). No silence penalties, no "they're losing interest" nudges. Profile hidden from new intros. Existing chats show: *"Busy until [date] — still interested."* |
| **Student why** | Dead week isn't ghosting. Stop treating it like it is. |

### 9. Safety: share plan, check-in, block, report

| | |
|---|---|
| **Problem** | First meets with classmates need a safety net, not a live tracker. |
| **Mechanism** | On accepted Date Card: optionally **share plan** (time, general location, first name) with **one contact** (phone/email — not in-app friend graph). One-tap **check-in** after ("I'm okay"). **Block** and **report** on any profile or chat; blocked users never reappear. Reports go to moderation queue. |
| **Student why** | Roommate already asks "text me when you're back." Make that one tap, not a feature pitch. |

### 10. Hide from classmates (anti-outing)

| | |
|---|---|
| **Problem** | Using a dating app in a 30-person lecture is an outing risk. |
| **Mechanism** | User enters **course codes** (e.g. CS 170) to **hide from**. Anyone in that course who also hid from it won't see you; you won't see them. No roster display, no "3 people from your class are here." |
| **Student why** | Small classes are gossip machines. You should be able to opt out of being visible to people you sit next to twice a week. |

### 11. Privacy defaults

| | |
|---|---|
| **Problem** | Dating apps leak social graph data that fuels drama on small campuses. |
| **Mechanism** | **Off by default, never shipped in MVP UI:** mutual friends, class rosters, "who viewed you," public ratings, reputation scores. Profile visible only to people you match or receive as a Weekly Drop intro. No browse-by-directory. |
| **Student why** | If the app becomes a stalking or gossip tool, students delete it. Defaults matter more than settings toggles. |

---

## Nice-to-haves (post-MVP)

Build after MVP retention is proven. Not blockers.

| Feature | Notes |
|---|---|
| **ICS / calendar import** | Auto-fill Office-Hours from Google/Outlook instead of manual toggles. |
| **More meet templates** | Club event, hackathon check-in desk — only after library/coffee/walk prove out. |
| **Soft busy auto-detect** | Suggest Busy mode during known exam periods if user linked academic calendar. |
| **Second weekly intro** | Power-user opt-in for seniors/job-searchers with bandwidth — still capped chats. |
| **Campus-specific place picker** | Map pins for actual buildings instead of template names. |
| **In-app safety contact** | Move check-in contact from phone/email to verified `.edu` friend — only if users ask for it. |

**Explicitly not building:** required voice prompts, crush-note anonymous reveals, reputation/rating systems (public or "quiet"), blurred club/class overlap graphs, "campus graph" privacy firewalls with dorm/lab node blocking. Those add complexity and outing/stalking risk without clear MVP payoff.

---

## vs. swipe-first apps

| They optimize for | We do instead |
|---|---|
| Time on app | One intro/week |
| Unlimited chats | 3 open chats, hard cap |
| Vague "let's hang" | Double-opt-in Date Card + meet templates |
| Silence = disinterest | Busy mode |
| Social graph features | Privacy defaults: no mutuals, rosters, viewers |
| Anyone with a phone | `.edu` + same-campus + distance filter |
| Stalking via class data | Hide-from-classmates, no overlap reveals |

---

## Fit with current codebase

| Today | MVP change |
|---|---|
| `/onboarding` persona quiz | Add `.edu`, major/year/interests, intent label, campus, distance pref |
| `/discover` swipe deck | Replace with Weekly Drop |
| `/matches` + `/messages` | Enforce 3-chat cap; gate full chat behind Date Card |
| `lib/swender.ts` localStorage | Persist profiles, availability, matches to Convex |

*Docs-only on `feat/student-features`.*

---

## SWE-native: PR review matching (v2)

**Status:** draft product addendum on `feat/swe-native-features`. Awaits answers in Open Questions below. Does not delete or supersede the student MVP above — it reframes the discovery/match mechanic in SWE terms and locks several product decisions.

**Relationship to sections above:** Keep student constraints (`.edu`, campus/distance, Office-Hours overlap, Weekly Drop cadence, 3-chat WIP, Date Card, Busy mode, safety, hide-from-classmates, privacy defaults). Replace the *interaction shape* of discovery: not swipe, not silent Pass/Like — a **code-review metaphor** end to end.

### Locked decisions (do not reopen without explicit product change)

| Decision | Lock |
|---|---|
| Core mechanic | Matching is **Pull Requests**, not swipes |
| Review outcomes | Exactly three: **Accept** / **Request Changes** / **Deny** |
| Review comments | **Mandatory** on every decision (Accept, Request Changes, and Deny) — engagement + signal |
| Identity | **GitHub-linked profiles required** (in addition to student `.edu` / campus verify from MVP above) |
| GitHub signal (assumed for now; user skipped deeper debate) | **Opt-in pinned repos/highlights** + **light public basics** only: top languages, avatar, bio. **No** deep co-contributor graph, no stalker enrichment, no private data |

### Design thesis (v2)

The product surface should feel like reviewing a PR: profile as diff, decision as review, mutual Accept as merge, Busy as red CI, chats as WIP-limited branches. If a control would work unchanged on a swipe app with a terminal skin, reject it.

**Anti–vibe-coded UI (v2):** Prefer craft / editorial / terminal review UI (status chips, comment threads, CI-style breakdowns). Avoid purple AI-slop dating chrome, heart-orb primary actions, and “% twin” gamification. Show fit as a checklist/matrix (intent, schedule, fingerprint, optional GitHub pins) — not romance glow.

### MVP delta (tight) — ship on top of student MVP

Ship only what makes the PR loop real. Defer biography-as-`git log`, Issues/RFCs, archives, creative-coding tracks, and campus place packs until the review loop retains.

#### A. PR inbox replaces swipe deck

| | |
|---|---|
| **Problem** | Silent Pass/Like trains zero-signal engagement. |
| **Mechanism** | `/discover` (or renamed route — Open Question) becomes an **inbox of open PRs**. Each candidate is a PR: profile diff (student fields + coding fingerprint + optional GitHub pins/basics + schedule overlap + why-this-PR). Queue stays **Weekly Drop**: one curated PR/week until resolved (aligned with student MVP §4). |
| **SWE why** | Reviews enter a queue; you do not infinite-scroll diffs for dopamine. |

#### B. Three-outcome review + mandatory comment

| Outcome | Meaning (product) | Typical next state |
|---|---|---|
| **Accept** | Approve this intro | Counts toward mutual merge; opens chat slot when both Accept (subject to 3-chat cap) |
| **Request Changes** | Interested, but not merge-ready | PR stays open / returns with a clear ask (e.g. different meet window, clarify intent). Not a silent maybe. |
| **Deny** | Close without merge | Cooldown (student MVP: 90 days). No match. |

**Hard rules (MVP):**

- Empty comment → action disabled. No silent Accept / Request Changes / Deny.
- Editable starter templates allowed; free-text always allowed. Templates are prompts, not the only path.
- UI copy: **Merged** on mutual Accept — not “It’s a match ♥.”
- Status chips: `open` → `approved` / `changes requested` / `closed` → `merged` when both Accept.

**Comment starters (illustrative):**

- Accept: “Schedule + intent look compatible — want to propose a Date Card.”
- Request Changes: “Interested if we can overlap a weekday Office-Hours block,” “Clarify friends-first vs dating.”
- Deny: “Intent mismatch,” “No schedule overlap this quarter,” “Not looking for this collaboration energy.”

#### C. GitHub-linked profile (required) + light signal

| | |
|---|---|
| **Problem** | SWE students already publish signal on GitHub; inventing a second identity is weaker and less trustworthy. |
| **Mechanism** | Account requires GitHub link (already the auth path on `main`). Profile may show **avatar, bio, top languages** (light public basics) and **user-selected pinned repos/highlights** (opt-in). Nothing else in MVP. |
| **Explicitly out** | Co-contributor / collaborator graphs, “people you may know from repos,” org membership stalking, LinkedIn scrape, private contribution reconstruction. |
| **SWE why** | Review the diff they chose to show — not a shadow dossier. |

#### D. Wire into existing student rails (no expansion)

- Matcher still requires intent compatibility + Office-Hours overlap before a PR enters the weekly inbox.
- Mutual Accept → chat under **max 3 open chats**; Date Card / first-meet templates / Busy / safety / hide-from-classmates / privacy defaults unchanged from student MVP.
- Coding fingerprint (agents / model mix / token burn) remains on the PR diff as structured fields — not a “% twin” badge.

### Post-MVP (v2 only — after PR loop retains)

| Idea | Notes |
|---|---|
| Commit History as biography | User-authored timeline; optional pin of public highlights |
| Issues / RFCs for slow courtship | Propose meets as Issues; quarter-intent as short RFC |
| Personal archives | Private notes on closed PRs / meets — not public reputation |
| Creative coding track | Arts/generative work as first-class interest, not emoji chip |
| Ethical forage expansion | Only with consent + disclosure; still no co-contributor graph unless explicitly reopened |

### Fit with current codebase (v2 delta)

| Today | v2 change |
|---|---|
| `/discover` swipe + `matching.swipe` like/pass | PR inbox + Accept / Request Changes / Deny + required comment; persist reviews in Convex |
| Mutual like = match | Mutual **Accept** + comments = **Merged** |
| GitHub auth only | Keep required; add opt-in pins + light public basics on profile/PR diff |
| Heart / Pass / Super like chrome | Review actions + status chips; kill swipe romance as primary UX |

### Open questions (remaining product decisions)

*Draft PR awaits answers. Locked items above are not listed again.*

1. **Brand:** Ship as **SWEnder** everywhere, or keep **Token Twin** as fingerprint/sub-brand?
2. **Queue policy:** Confirm **one Weekly Drop PR** vs. small rolling review queue (e.g. max 3 open PRs) while keeping student cadence philosophy?
3. **Request Changes semantics:** Who must act next — author updates profile/availability, reviewer re-reviews, or either? Max rounds before auto-close? Does Request Changes consume the weekly slot?
4. **Request Changes visibility:** Is the comment always visible to the other person (true review thread), or only after they re-open / respond?
5. **Deny comment visibility:** Full comment, redacted reason category, or closed with no body shown?
6. **Accept comment visibility:** On merge immediately, or gated until Date Card?
7. **Min comment length / quality:** Character minimum only, or soft checks against empty template submits?
8. **Date Card vs. chat:** Full chat on merge, or Date Card required to unlock long-form messaging?
9. **Launch campus:** Stanford, UT Austin (current seeds), or multi-campus day one? (Campus-specific copy stays behind packs.)
10. **Fingerprint weight:** Primary match signal vs. secondary to intent + schedule + interests (+ optional pins)?
11. **Moderation of review comments:** Blocklist, report-only, or assist for harassment especially on Deny / Request Changes?
12. **Route rename:** Keep `/discover` or move to `/pulls` / `/inbox`?
13. **Super-priority PR:** Any “request review ASAP” analogue, or explicitly none under Weekly Drop?
14. **Light GitHub basics source of truth:** Live fetch on view vs. snapshot at onboarding/refresh — and what if bio/languages change?

---

*v2 addendum is docs-only. Implementation starts after Open Questions are answered. Do not merge this draft until product locks the remaining decisions.*
