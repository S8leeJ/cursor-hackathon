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

**Relationship to sections above:** Keep student constraints (`.edu`, campus/distance, Office-Hours overlap, 3-chat WIP, Date Card, Busy mode, safety, hide-from-classmates, privacy defaults). Replace silent Pass/Like with a **code-review metaphor**. **Discovery cadence/shape** (Weekly Drop vs hybrid vs rolling queue) remains an **Open Question** until the user’s hybrid discovery explanation lands — do not treat Weekly Drop as locked in v2.

### Locked decisions (do not reopen without explicit product change)

| Decision | Lock |
|---|---|
| Core mechanic | Matching decisions are **Pull Request reviews**, not swipes |
| Review outcomes | Exactly three: **Accept** / **Request Changes** / **Deny** |
| Review comments | **Mandatory** on every decision (Accept, Request Changes, and Deny) — engagement + signal |
| Review comment visibility | **GitHub-style transparency:** Deny, Request Changes, **and** Accept review comments are **VISIBLE to the PR author** by default. No silent/hidden decisions. |
| Moderation posture | Visibility stays the default; ship **moderation + rate limits** so transparent reviews do not become harassment (see §E). |
| GitHub identity (MVP hard constraint) | Profiles **MUST** link GitHub via **OAuth / verified GitHub link**. No GitHub → cannot complete onboarding or enter the match pool. Non-negotiable. |
| Public GitHub signal | **Public signal matters** and is first-class in profile + matching: **repos**, **contribution graph**, **READMEs**, and **issues/PRs as taste signal**. Design the profile “diff” and match rationale around that signal (still public-only; no private-repo access). |
| Co-contributor graph | Still **out** unless explicitly reopened: no “people you may know from repos,” no collaborator stalking graphs. Public artifacts ≠ social graph enrichment. |

*Supersedes the earlier v2 assumption of “light basics + opt-in pins only.” Pins/highlights may still help curation, but MVP profile/matching is built on richer **public** GitHub signal as locked above.*

### Design thesis (v2)

The product surface should feel like reviewing a PR: profile as diff (student fields + **public GitHub evidence**), decision as review, mutual Accept as merge, Busy as red CI, chats as WIP-limited branches. Taste is inferred from what someone ships and how they participate in public issues/PRs — not from photo carousels.

**Anti–vibe-coded UI (v2):** Prefer craft / editorial / terminal review UI (status chips, comment threads, repo/README excerpts, contribution graph as a calm chart — not a flex badge farm). Avoid purple AI-slop dating chrome, heart-orb primary actions, and “% twin” gamification. Show fit as a checklist/matrix (intent, schedule, fingerprint, GitHub signal breakdown) — not romance glow.

### MVP delta (tight) — ship on top of student MVP

Ship GitHub-required identity + public-signal profiles + the three-outcome PR review loop. Defer biography-as-authored-`git log`, in-app Issues/RFCs for courtship, personal archives, creative-coding tracks, and campus place packs until the review loop retains. **Do not lock discovery UX** beyond “not swipe” until Open Question #1 is answered.

#### A. Decision UX: three-outcome review + mandatory comment

*(How candidates arrive — Weekly Drop vs hybrid discovery — is Open Question #1. Whatever the inbox shape, every decision uses this review model.)*

| Outcome | Meaning (product) | Typical next state |
|---|---|---|
| **Accept** | Approve this intro | Counts toward mutual merge; opens chat slot when both Accept (subject to 3-chat cap) |
| **Request Changes** | Interested, but not merge-ready | PR stays open / returns with a clear ask (e.g. different meet window, clarify intent, “want to see a pinned systems repo”). Not a silent maybe. |
| **Deny** | Close without merge | Cooldown (student MVP default: 90 days, unless discovery policy changes it). No match. |

**Hard rules (MVP):**

- Empty comment → action disabled. No silent Accept / Request Changes / Deny.
- **Visibility:** The review comment body is shown to the **PR author** for Accept, Request Changes, and Deny (GitHub-style). Default is visible — not opt-in, not redacted-by-default.
- Editable starter templates allowed; free-text always allowed. Templates are prompts, not the only path.
- UI copy: **Merged** on mutual Accept — not “It’s a match ♥.”
- Status chips: `open` → `approved` / `changes requested` / `closed` → `merged` when both Accept.

**Comment starters (illustrative):**

- Accept: “Liked the README taste + schedule overlap — want to propose a Date Card.”
- Request Changes: “Interested if we can overlap a weekday Office-Hours block,” “Clarify friends-first vs dating,” “Would love a pin on the project you actually care about.”
- Deny: “Intent mismatch,” “No schedule overlap this quarter,” “Public work isn’t the kind of collaboration I’m looking for.”

#### B. GitHub OAuth / link — non-negotiable in MVP

| | |
|---|---|
| **Problem** | Without GitHub, SWEnder collapses into a generic campus dating profile with a terminal font. |
| **Mechanism** | **GitHub OAuth (or equivalent verified GitHub account link) is required** to finish onboarding and to be eligible for matching. Aligns with current `main` (GitHub-only auth) and hardens it as product law: unlink / missing GitHub → blocked from the pool. `.edu` / campus verify from student MVP still applies alongside GitHub. |
| **SWE why** | The profile is a review of public engineering identity, not a blank bio card. |

#### C. Profile + matching designed around public GitHub signal

| | |
|---|---|
| **Problem** | Self-description lies; public repos, contribution graph, READMEs, and issue/PR behavior are higher-bandwidth taste signal for SWE students. |
| **Mechanism (MVP)** | Profile / PR diff surfaces **public** GitHub evidence as first-class sections, e.g.: selected or ranked **repos**; **contribution graph** (activity rhythm, not a vanity scoreboard); **README** excerpts / project summaries; recent or representative **issues & PRs** as taste (how they write, what they care about, review tone). Matching may use this signal for ranking/rationale blurbs (“why this PR”) together with intent, campus, schedule overlap, and coding fingerprint. |
| **Consent / ethics** | Public-only. Disclose in onboarding what we read and show. User can choose highlights/pins to emphasize, but cannot fake “no GitHub.” No private repos, no non-consensual social-graph expansion, no LinkedIn scrape. |
| **Explicitly out (unless reopened)** | Deep **co-contributor / collaborator graphs**, “people you may know from repos,” org-membership stalking, reconstructing private activity. |
| **SWE why** | You review the artifact and the trail — READMEs and issue threads are the cover letter. |

#### D. Wire into existing student rails (no expansion)

- Intent compatibility + Office-Hours overlap remain gates before someone is worth a review (regardless of discovery shape).
- Mutual Accept → chat under **max 3 open chats**; Date Card / first-meet templates / Busy / safety / hide-from-classmates / privacy defaults unchanged from student MVP.
- Coding fingerprint (agents / model mix / token burn) remains on the PR diff as structured fields — not a “% twin” badge — and sits **beside** GitHub public signal, not instead of it.

#### E. Visible reviews + anti-harassment (MVP requirement)

Transparent Deny/Request Changes/Accept comments are the product. They must not become a harassment channel. Ship guardrails **with** the review loop — not as a post-MVP apology.

| | |
|---|---|
| **Problem** | Visible reject text can be weaponized (slurs, appearance attacks, pile-ons) if there are no brakes. |
| **Default** | Comments remain **visible to the PR author**. Do not “fix” transparency by hiding Deny bodies. |
| **Mechanism (MVP floor)** | (1) **Rate limits** on reviews sent / Denies per day (and tighter caps for brand-new accounts). (2) **Block + report** on any review thread; block removes them from future PRs. (3) **Policy + templates** steer toward schedule/intent/taste-of-work reasons — not appearance or identity attacks. (4) **Moderation queue** for reports; repeat offenders lose review privileges or account. (5) Optional light **blocklist / toxicity assist** if cheap to ship — exact stack is an Open Question; the *requirement* to design against harassment is locked. |
| **SWE why** | GitHub shows review comments; GitHub also bans abuse. Transparency without enforcement is negligence. |

### Post-MVP (v2 only — after PR loop retains)

| Idea | Notes |
|---|---|
| Commit History as biography | User-authored timeline layered on top of public GitHub trail |
| Issues / RFCs for slow courtship | Propose meets as Issues; quarter-intent as short RFC |
| Personal archives | Private notes on closed PRs / meets — not public reputation |
| Creative coding track | Arts/generative work as first-class interest, not emoji chip |
| Richer forage controls | Finer user controls over which public artifacts appear; still no co-contributor graph unless reopened |

### Fit with current codebase (v2 delta)

| Today | v2 change |
|---|---|
| GitHub-only Clerk auth | Keep; document as **hard MVP requirement** for profile + match eligibility |
| Profile = name/school/bio + AI fingerprint | Add public GitHub signal sections (repos, contribution graph, README/issue-PR taste) on profile and on the PR diff |
| `/discover` swipe + `matching.swipe` like/pass | Replace decision UX with Accept / Request Changes / Deny + required **visible** comment; **discovery/inbox shape TBD** (Open Question) |
| Mutual like = match | Mutual **Accept** + comments = **Merged**; review bodies visible to author |
| Heart / Pass / Super like chrome | Review actions + status chips; kill swipe romance as primary UX |
| No abuse controls on swipe | Add review **rate limits**, report/block on threads, moderation queue |

### Open questions (remaining product decisions)

*Draft PR awaits answers. Locked items above are not listed again (including comment visibility = visible to author).*

1. **Discovery (blocking):** What is the **hybrid discovery** model? Weekly Drop only, rolling PR inbox, user-browsable public-signal search, or a hybrid? *(Awaiting user’s explanation — leave unspecified in MVP engineering until answered.)*
2. **Brand:** Ship as **SWEnder** everywhere, or keep **Token Twin** as fingerprint/sub-brand?
3. **Queue / cadence policy:** If hybrid, how do Weekly Drop and any browse/search lanes share WIP and cooldowns?
4. **Request Changes semantics:** Who must act next — author updates profile/availability/pins, reviewer re-reviews, or either? Max rounds before auto-close? Does Request Changes consume a weekly (or hybrid) slot?
5. **Min comment length / quality:** Character minimum only, or soft checks against empty template submits?
6. **Date Card vs. chat:** Full chat on merge, or Date Card required to unlock long-form messaging?
7. **Launch campus:** Stanford, UT Austin (current seeds), or multi-campus day one? (Campus-specific copy stays behind packs.)
8. **Signal weights:** Relative weight of GitHub public signal vs intent + schedule + interests vs AI coding fingerprint?
9. **Which GitHub artifacts by default:** Auto-pick top repos / recent PRs vs require user curation of pins before entering the pool?
10. **Contribution graph presentation:** Raw GitHub-style graph, abstracted activity bands, or both? Avoid shame UX for sparse graphs (research-heavy / new frosh).
11. **Moderation stack details:** Exact rate-limit numbers; blocklist-only vs report-only vs LLM/toxicity assist; SLA for human review of reports? *(Requirement to ship anti-harassment controls is locked; implementation knobs are open.)*
12. **Author reply on Deny:** Can the PR author reply once to a visible Deny comment, or is Deny terminal (comment visible, thread closed)?
13. **Route rename:** Keep `/discover` or move to `/pulls` / `/inbox`?
14. **Refresh / source of truth:** Live GitHub fetch on view vs snapshot on onboarding/refresh — staleness policy when README/repos change?
15. **Super-priority PR:** Any “request review ASAP” analogue, or explicitly none?

---

*v2 addendum is docs-only. Implementation starts after Open Questions are answered (especially discovery). Do not merge this draft until product locks the remaining decisions.*
