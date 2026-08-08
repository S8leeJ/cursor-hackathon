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
