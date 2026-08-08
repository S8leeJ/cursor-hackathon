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

---

## Hybrid discovery (invented) — "The Triage Board"

**Status:** Invented hybrid to close the discovery open question with a concrete, multi-lane design. Append-only ideation; does not delete prior MVP/v2 text. Still respects locks: PR **Accept / Request Changes / Deny** + **mandatory visible** review comments; **GitHub-linked profiles required**; GitHub signal = **opt-in pins + light public basics** (avatar, bio, top languages, user-selected pins/highlights); **campus = soft boost** (same-campus ranks higher, never a hard wall unless the student MVP distance prefs say otherwise); anti–vibe-coded UI (craft/terminal/editorial — no purple AI-slop dating chrome).

**Diabolical (allowed):** playful SWE-dark humor and sharp mechanics. **Forbidden:** harassment, stalking, non-consensual scraping, doxxing, shadow reputation scores.

### Why a Triage Board (not a swipe deck)

Infinite swipe recreates dopamine debt. A single Weekly Drop is honest but can feel starved. The Triage Board is a **Kanban of intros**: multiple lanes with different intents, one shared **WIP budget**, shared **cooldowns**, and the same review ritual on every card. You triage like an on-call engineer — not like a casino.

### Global WIP & cooldown constitution (applies to ALL lanes)

| Rule | Mechanic |
|---|---|
| **Open PR WIP** | Max **3 open PRs** across the whole board (all lanes combined). Opening a 4th is blocked until you Accept / Request Changes / Deny one. |
| **Chat WIP** | Still max **3 open chats** after merge (student MVP). PR WIP and chat WIP are separate meters; both bite. |
| **Review tax** | Every decision costs a **Review Token** (see Diabolical engagement systems). Rubber-stamping drains streak; empty comments are impossible. |
| **Person cooldown** | Deny → **90-day** person cooldown across *all* lanes. Request Changes → person stays on *that* PR only; they cannot reappear as a fresh card in another lane until the thread resolves or expires. |
| **Lane fairness** | Hotfix cannot starve Merge Train: if Merge Train has an unresolved card past SLA, Hotfix / Chaos pause intake. |
| **Campus soft boost** | Same-campus candidates sort higher inside a lane; cross-campus still eligible unless user set a hard distance cap in student prefs. |
| **No infinite scroll** | Lanes show a **finite stack** (cap per lane below). Empty lane ≠ “load more randoms.” It means wait for the next train / refresh window. |
| **GitHub gate** | No linked GitHub → board is locked. Pins + light public basics render on every PR diff; no co-contributor graph, no shadow dossier. |

### Lane A — Weekly Merge Train (curated 1–3 PRs)

| | |
|---|---|
| **Cadence** | Every Monday 09:00 local campus time: **1–3** curated PRs land in `merge-train/`. |
| **Curation** | Intent match + schedule overlap + soft campus boost + light GitHub pin/language affinity + coding fingerprint. Human-readable **why-this-PR** blurb required on each card. |
| **Cap** | Max 3 cards/week. Unreviewed train cars block next Monday’s drop (you cannot hoard). |
| **Diabolical cleverness** | The train does not leave the station until you review. Ghosting the Merge Train is a failing CI check on *you*, not on them. |

### Lane B — Hotfix / Dependabot of Desire (trending public-signal matches)

| | |
|---|---|
| **Cadence** | Rolling, but throttled: at most **2 new cards / day**, and only if global WIP < 3. |
| **Signal** | Opt-in pins + light public basics that *moved* recently (new pin, README tweak the user marked “highlight,” language mix shift) — not stalker scrapes of private activity. |
| **Cap** | Lane depth max **2** visible. No paginated abyss. |
| **Diabolical cleverness** | Dependabot PRs are annoying because they are often correct. Hotfix surfaces “annoying but compatible” matches — high signal, low fantasy. Dismissing without a comment is illegal; Dependabot always leaves a note. |

### Lane C — Blame-the-Algorithm chaos mode (opt-in friction matches)

| | |
|---|---|
| **Opt-in** | Off by default. Enabling requires typing `I accept merge conflicts in my inbox`. |
| **Cadence** | At most **1 chaos PR / week**, nights-only delivery (local 21:00–23:00) so it feels like a flaky integration test. |
| **Matching** | Intentionally *orthogonal*: different agent stack, opposite token-burn band, or complementary pin topics — still intent-compatible and schedule-overlapping. Soft campus boost still applies. |
| **Cap** | 1 card. If ignored 7 days → auto-close with a system comment: `flaky test timed out`. |
| **Diabolical cleverness** | Chaos is a controlled experiment, not cruelty. You asked the algorithm to blame itself; it ships one spicy diff and waits for your visible review. |

### Lane D — Office-Hours Walk-ins (availability-first)

| | |
|---|---|
| **Cadence** | Live during overlapping Office-Hours windows only. When your free block starts, up to **2 walk-ins** who share that window can appear. |
| **Matching** | Availability is the primary key; GitHub pins/basics + intent are secondary. Soft campus boost. |
| **Cap** | 2. Walk-ins expire when the shared window ends (PR auto-closes: `office hours ended`). |
| **Diabolical cleverness** | Romance with a queue number. If you skip the walk-in, you are skipping a human who is free *right now* — the comment must admit that. |

### Cross-lane state machine (no swipe reincarnation)

```
[Lane intake] → open PR (counts toward WIP=3)
     ↓
Accept (visible comment) ──┐
Request Changes (visible) ─┼→ thread continues / re-review
Deny (visible) ────────────┘→ 90-day person cooldown (all lanes)

Merge (mutual Accept) → chat slot (chat WIP=3) → Date Card / meet rails
```

- A person cannot be in two lanes at once.
- Moving lanes is impossible; only triage outcomes move state.
- “See more like this” is forbidden. Use Request Changes to ask for a *specific* patch (“pin your systems repo,” “clarify friends-first”).

### Anti–vibe-coded UX for the board

- Columns labeled like a real triage board (`merge-train`, `dependabot`, `chaos`, `walk-ins`), monospace metadata, editorial serif for names.
- Status chips only: `open` / `changes requested` / `approved` / `closed` / `merged`.
- No heart orbs, no purple gradients, no “% twin” glow. Fit shown as a CI matrix: intent · schedule · campus soft-boost · pins/languages · fingerprint.

---

## Feature forge (keep going)

Named features beyond the thin MVP. Each is a mechanic with a reason — not a pun sticker. Ethical bounds: public/consensual GitHub signal only (opt-in pins + light basics), no doxxing, no shadow elo.

### History / changelog

1. **`CHANGELOG.md` Biography** — User-maintained dated entries (`Added` / `Changed` / `Fixed` life events). Clever because reviewers skim changelogs before code; same ritual for people.
2. **Semantic Version Self** — Profile shows `vMAJOR.MINOR.PATCH` for life phase (major = campus/degree shifts). Diabolical: you must bump version on intent changes or the board labels you `stale manifest`.
3. **Annotated Tag Memories** — After a merged meet, optionally tag the chat era (`v1.0.0-first-coffee`). Private to you unless both export — archive, not flex.
4. **Revert-Safe Backstory** — Edits to bio/pins create a diff you can roll back for 7 days. Clever: profiles become reviewable artifacts, not memory-holed rewrites.
5. **Bisect Night** — Opt-in questionnaire that binary-searches “when did your taste in projects change?” Diabolical: forces narrative honesty without a therapist chatbot.

### Arts / creative-coding

6. **Shader Sunday Gallery** — Pin generative sketches (p5, shaders, demos) as first-class taste signal beside SWE repos. Clever: arts kids stop being emoji hobbies.
7. **Critique Protocol** — Accept comments on art pins must cite one concrete craft detail (color, motion, constraint). Diabolical: bans “cool lol” rubber stamps on creative work.
8. **Demo Reel Diff** — Side-by-side before/after of a creative project on the PR card. Clever: progress > polish porn.
9. **Constraint Jam Pairing** — Date Card template: 90-minute build under a shared constraint (`no frameworks`, `only CSS`). Diabolical: chemistry under compile pressure.

### Ethical forage (public, consented)

10. **Pin Provenance Labels** — Each pin shows `user-selected` vs `auto-suggested from public basics`. Clever: makes curation visible; kills mystery-meat profiles.
11. **Language Weather Report** — Soft chart of top languages from light public basics, updated on refresh. Diabolical: “it’s giving TypeScript autumn” without scraping private commits.
12. **README First Paragraph Rule** — PR diff quotes only the first paragraph of a pinned README unless expanded. Clever: respects attention; rewards writers who lead well.
13. **Issue Taste Sampler** — Opt-in: show up to 3 *public* issues/PRs the user marked as taste samples. Ethical forage with a curator, not a vacuum.
14. **Forage Firewall** — Hard ban list in product law: no co-contributor graphs, no follower overlaps, no class roster joins, no LinkedIn. Diabolical in the good way: the app refuses delicious stalking features.

### CI/CD romance

15. **Green Build Availability** — Office-Hours windows must be “green” (not Busy, not midterm freeze) before Walk-ins open. Clever: red CI cannot schedule romance.
16. **Merge Queue for Dates** — Accepted Date Cards enter a personal merge queue ordered by time; conflicts auto-surface. Diabolical: two Friday 7pm coffees become a merge conflict, not a ghosting mystery.
17. **Required Checks** — Before chat unlock depth increases: both not Busy, intent compatible, ≥1 shared window. Failures explain themselves like CI logs.
18. **Canary Date** — First meet is always a canary: 20-min walk / library block templates only. Clever: production traffic comes after canary passes.
19. **Feature Flag Flirting** — Soft prompts (“share Spotify?”) stay behind flags both must enable. Diabolical: no surprise scope creep mid-chat.

### RFC dates & issue trackers

20. **RFC: How I Want to Spend This Quarter** — Short structured doc (goals, bandwidth, dealbreakers). Reviewers must reference it in Accept comments. Clever: forces reading the design doc.
21. **Issue-Driven Ask** — Instead of “wyd”, open an Issue: `feat: Thursday library block`. Labels: `good first meet`, `needs schedule`, `wontfix`. Diabolical: chat becomes a tracker with states.
22. **CODEOWNERS Wingpeople** — Opt-in trusted friends who can *suggest* a Merge Train candidate to you (not message them). Clever: human codeowners without outing graphs.
23. **ADRs for Breakups** — Archive-only Architecture Decision Record when you close a chat (`Context / Decision / Consequences`). Private postmortem culture, not public drama.

### Forks, upstream, dependencies

24. **Fork vs Upstream Intent** — Label whether you want to build something new together (fork) or join their existing life rhythm (upstream). Diabolical: mismatch becomes an explicit Request Changes theme.
25. **Dependency Hell Matching** — Soft warning when both have Extreme token burn + no shared free windows: `peer dependency conflict`. Clever: names the failure mode before the thread dies.
26. **Lockfile Honesty** — Onboarding asks what you will *not* negotiate (sleep, research lab nights, religious practice). Surfaced as lockfile entries on the PR. Diabolical: non-negotiables stop being footnotes.
27. **Semver Expectations** — Mark dating as `^` (flexible) or `~` (narrow). Matcher soft-boosts compatible ranges. Clever: version ranges beat vague bios.

### Flaky tests & blame

28. **Flaky Test Flirting** — If someone Accepts then goes dark <24h without Busy mode, thread gets `flaky` label and a single visible bot nudge. Diabolical: names the flake without public shaming scores.
29. **git blame Soft Mode** — On Request Changes, you must highlight a *specific* profile hunk (pin, intent, schedule cell). Clever: blame a line, not a soul.
30. **Stack Trace Intros** — First chat message templates look like stack frames (`at LibraryCoffee.propose()`). Optional, opt-in aesthetic — terminal craft, not emoji soup.

### Release trains & rollbacks

31. **Release Train Meetups** — Campus soft-boosted group study releases (library wings) as optional multi-merge events with WIP caps. Clever: social without drunken mixer energy.
32. **Rollback After Bad Date** — Either person can `revert` the Date Card outcome within 48h: chat stays, no pressure for date #2; optional private postmortem template. Diabolical: rollback is civilized, not ghost protocol.
33. **Hotfix Relationship Patch** — Mid-chat, propose a one-line contract patch (“async Sundays only”). Both must Accept. Clever: relationships get patches without ultimatums.
34. **Deprecation Notice** — Soft wind-down: mark a chat `deprecated` with sunset date before hard close. Diabolical: deprecations are kinder than sudden 404s.

### Stanford / CS seasoning (verified vibes only)

35. **LaIR Energy Mode** — Availability preset inspired by Stanford CS106 **LaIR** helper hours: short, queued, focused help-shaped free blocks (15–30 min). Verified campus pattern; used as schedule metaphor, not an official Stanford integration.
36. **Coterm Horizon Tag** — Optional tag for students in / considering Stanford **Coterm** (concurrent BS/MS). Soft-boost with peers who marked “long horizon on the Farm.” Verified program; no fake prestige scoring.
37. **Farm Soft Boost** — “The Farm” as Stanford’s real nickname appears only in Stanford campus pack copy; soft-boost same-campus as already locked. No invented fountain rituals.
38. **TreeHacks Freeze** — Busy preset for Stanford’s **TreeHacks** (~36h hackathon) and analogous hackathons elsewhere. Verified event; auto-suggest Busy, never auto-punish silence.

### Terminal UX / archive museum

39. **`swender pr checkout` Palette** — Command-palette navigation (`/` opens commands: `review`, `request-changes`, `open-date-card`). Clever: power users triage faster without swipe muscle memory.
40. **Museum of Closed PRs** — Personal archive of Denied/Expired PRs with *your* visible comments and outcomes. Private museum for pattern recognition — not a public hall of shame.
41. **TTY Onboarding** — Optional onboarding skin that feels like a setup wizard in a terminal (steps as prompts, not progress hearts). Anti-vibe craft direction.
42. **Man Page Profiles** — Profile sections as `NAME`, `SYNOPSIS`, `OPTIONS`, `SEE ALSO` (pins). Diabolical: skimmable like real docs; rewards structured humans.
43. **Pager Duty Couples** — After merge, opt-in shared “on-call” window for text responsiveness expectations. Clever: SLOs for communication without read receipts theater.
44. **Hex Dump Secrets** — Spoilers for optional fun facts revealed only after mutual Accept (rot13/hex joke). Playful, consensual, not catfishing.

### More diabolical mechanics (keep going)

45. **Reviewer Roulette Opt-out** — Chaos lane cannot re-enable for 14 days after disable (cooldown on the experiment itself). Clever: prevents toggling chaos as a boredom slot machine.
46. **Monorepo Household Mode** — Post-MVP friends-first: match study groups as a “workspace” with multiple CODEOWNERS. Still no roster stalking.
47. **Sast of the Heart** — Lightweight copy lint on review comments (blocklist + “attack on appearance” heuristics) before submit. Ethical safety, not shadow scoring of people.
48. **Artifact Required on Deny** — Deny must include either a template reason code *or* a suggested patch (“try walk-ins Tue 3pm”). Diabolical: pure “no” without a diff is rejected by the form validator.
49. **Merge Freeze Calendar** — User-declared freezes (midterms, recruit season) publish to the board as lane blackouts. Clever: honesty beats unexplained silence.
50. **Observability for Self** — Private dashboard: reviews written, rubber-stamp warnings, walk-ins missed, mean time-to-review. Insights for *you* — never a public leaderboard.

---

## Diabolical engagement systems

Systems that **force quality** without harassment. All review comments remain **visible to the PR author**. Rate limits + block/report still apply.

### Review Tokens & LGTM economics

| System | Mechanic | Why it’s sharp |
|---|---|---|
| **Review Tokens** | Each Accept / Request Changes / Deny spends 1 token. Regen: +3 on Monday (Merge Train day), +1 daily cap, cannot bank >7. | Finite reviews → triage, not spray. |
| **LGTM Tax** | Accept with a comment shorter than the rubric minimum costs **2 tokens** and breaks **Quality Streak**. | “LGTM” is expensive; real review is cheaper. |
| **Rubber-Stamp Detector** | Same Accept template used ≥3 times in 7 days → forced free-text + warning. Streak burns. | Stops template farming. |
| **Deny Requires a Patch Suggestion** | Deny must include a non-empty `suggestion` field (schedule, intent, pin ask, or `wontfix: <reason code>`). | GitHub-style: request a path forward or own the wontfix. |
| **Request Changes SLA** | Author has 7 days to patch; reviewer must re-review within 3 days of patch or lose 1 token. | Threads don’t rot in `changes requested` hell. |

### Comment rubrics (mandatory structure, still human)

Visible comments must include:

1. **Hunk reference** — what you looked at (pin, RFC line, schedule overlap, intent).
2. **Signal** — one concrete observation.
3. **Decision clause** — why Accept / Request Changes / Deny follows.

Form UX provides three short fields; concatenated body is what the author sees. Empty field → submit disabled.

### Streaks that punish laziness (not silence)

| Streak | Rules |
|---|---|
| **Quality Streak** | +1 per day you submit a rubric-complete review. Breaks on rubber-stamp or toxicity block. |
| **No Ghost Streak** | Breaks if an open PR ages >72h without Busy mode. | Busy mode pauses timers (student MVP respect). |
| **Chaos Honor** | If Chaos lane enabled, resolving the weekly chaos PR on time boosts Merge Train curation weight next week. |

*No public streak flex. No leaderboards. Private meters only.*

### Anti-harassment coupled to engagement

- Token spend does not bypass rate limits (e.g. max Denies/day).
- Toxicity / blocklist hit refunds no tokens; may freeze review privileges.
- Block removes them from all lanes and burns their open PRs toward you as `closed by block`.
- Visible Deny is allowed; cruel Deny is reportable; reports enter the moderation queue (v2 §E).

### Board health checks (CI for the product)

- If >50% of your weekly decisions are Deny with reason code `wontfix: vibe` → soft prompt to refine intent/filters (not a ban).
- If Walk-ins expire unread repeatedly → Merge Train size shrinks to 1 until you clear WIP (the board stops overfeeding you).
- Hotfix pauses if you have any PR `open` >48h (dependabot won’t pile on).

### Locked reminders (do not “creatively” undo)

- Accept / Request Changes / Deny + **mandatory visible** comments
- GitHub link required; signal = **opt-in pins + light public basics**
- Campus = **soft boost**
- No infinite swipe reincarnation via Triage Board rules
- No harassment / stalking / non-consensual scraping / doxxing / shadow reputation

---

*Append-only creative expansion for draft PR discussion. Docs-only; do not merge to main until product explicitly asks.*

---

## Hybrid discovery — The Triage Board (invented)

SWEnder is **NOT** an infinite swipe deck. Discovery is a multi-lane triage board with a **global WIP limit** (default **max 3 open PRs** across all lanes).

This section is an additional, concrete wiring of the hybrid (append-only; earlier Triage Board / forge text above remains). Locks still hold: Accept / Request Changes / Deny + mandatory **visible** review comments; GitHub-linked profiles required; GitHub signal = opt-in pins + light public basics; campus = soft boost only.

### Lanes (coexist)

- **Lane A — Weekly Merge Train:** Monday drop of **1–3** curated PRs against you / for you to open; scarcity. Unreviewed cars block the next train.
- **Lane B — Hotfix:** Opt-in public-signal forage (pins, languages, star intersection); browse is free-ish, but **opening a PR consumes WIP**.
- **Lane C — Chaos / Blame-the-Algorithm (opt-in):** Dependency Hell & Merge Conflict matching for friction-seekers. Off by default.
- **Lane D — Office-Hours Walk-ins:** Availability-first; book a slot like **LaIR**, then open a short **Good-First-Issue** PR. Walk-ins expire when the shared window ends.

### Cross-lane rules (how WIP wires the board together)

| Rule | Behavior |
|---|---|
| **Global open-PR WIP** | Max **3** open PRs total across A–D. Lane intake pauses when WIP is full. |
| **One person, one lane** | A candidate cannot appear in two lanes at once. |
| **Person cooldown** | Deny → cross-lane cooldown (default 90 days). Request Changes keeps the thread; no duplicate cards elsewhere. |
| **CI on decisions** | Rubber-stamp Accept without a real comment is **rejected by CI**. Empty Deny / Request Changes also rejected. |
| **Visibility** | Deny / Request Changes / Accept comments are **visible** to the PR author (GitHub-style). |
| **Campus** | Soft boost only (sort/rank), not a hard wall unless the user set an explicit distance cap. |
| **No infinite swipe** | Finite stacks per lane; no “load more randoms.” Empty means wait for the next train / window / Hotfix refresh. |
| **Lane fairness** | If Merge Train has overdue cars, Hotfix / Chaos intake pauses until the train is triaged. |

### Minimal state machine

```
Lane intake → open PR (WIP++) → Accept | Request Changes | Deny (visible comment, CI-checked)
Mutual Accept → Merged → chat (separate chat WIP) → Date Card / meet rails
Deny → cooldown (all lanes); Request Changes → patch → re-review
```

---

## Diabolical feature backlog (append)

Paste-forward backlog of **45** named features. Docs-only ideation; ethical bounds unchanged (no stalking, doxxing, non-consensual scraping, or shadow reputation scores).

### Hybrid Multi-Lane Discovery

1. **Lane Switcher** — Profile opens in Hotfix / Docs / Diffs lanes; switching lanes ≠ switching people.
2. **Sparse Checkout** — First view README + 3 pins; full tree after mutual watch.
3. **Monorepo Mode** — career / art / hobbies as separately reviewable packages.
4. **Worktree Dates** — parallel draft intents (coffee / project / mentorship); merge when both agree.
5. **git sparse-index Filter** — visible compiled match filters (anti-black-box).
6. **LaIR Queue** — opt-in venue tags (LaIR desk, Farm courtyard, coterm OH) — no GPS trails.

### History / Changelog / Archives

7. **CHANGELOG.md Dating** — mutual bio/bounds edits as Keep-a-Changelog; both can blame.
8. **Annotated Tag Releases** — milestones as signed tags with dual release notes.
9. **git stash Feelings** — private notes until you push.
10. **Reflog (Personal Only)** — your undo history; never theirs.
11. **Cold Storage Archive** — closed threads exportable read-only; no silent deletes.

### Arts / Creative Coding

12. **Shader Courtship** — GLSL/canvas bio; fork + PR a visual reply.
13. **Generative Compat Seed** — shared RNG from mutual stars → co-made generative piece.
14. **ASCII / Terminal Gallery** — less-style pager profiles; ANSI art.
15. **Live Coding Pair Slot** — 45m kata/sketch; green-pair badge if both push.

### Ethical Forage

16. **Public Commit Weather** — 90d activity shape as weather icon; no hour heatmaps.
17. **Star Intersection** — shared stars/topics Venn; no private inference.
18. **CODEOWNERS Affinity** — opt-in ownership paths as taste tags.
19. **Issue Archaeology** — nominate 1–3 proud public issues only.

### CI/CD Dating Ops

20. **Pipeline of Intent** — Lint→Unit→Integration→Deploy; skips need RFC.
21. **Required Checks** — Boundaries CI before Accept.
22. **Flaky Test Protocol** — flaky vibe opens retry issue; no silent ghost.
23. **Canary Deploy** — 60m first hangout + kill switch; promote to prod calendar.
24. **Blue/Green Profiles** — stable vs canary bio tracks.

### RFCs / Issues / PRs

25. **Courtship as PR** — (locked core)
26. **RFC Before Exclusive** — DTR as RFC with 72h comment period.
27. **Issue Templates for Conflict** — Needs clarification / Scope creep / Blocked on capacity.
28. **Good First Issue** — low-stakes openers.
29. **Dependabot for Boundaries** — scheduled “needs outdated?” review.

### Forks / Conflicts / Owners

30. **Friendly Fork** — lifestyle experiments via PR.
31. **Merge Conflict Ritual** — 3-way merge for calendar/values.
32. **CODEOWNERS for Topics** — money/travel/family/career ownership.
33. **Upstream Sync** — quarterly PR to your own profile.

### Canary / Rollback / Postmortems

34. **One-Click Rollback** — roll back last commitment + mandatory postmortem.
35. **SEV Dating Postmortem** — blameless doc after bad date/fight.
36. **Feature Flag Affection** — pet names/PDA behind dual toggles.
37. **Chaos Monday (Opt-In)** — hard-conversation game day.

### Terminal / Campus texture

38. **`~/.swenderrc`** — shared prefs on Accept.
39. **`man swender-date`** — norms as man page.
40. **Pager Etiquette** — long messages paginate.
41. **Coterm Track** — opt-in dual-degree tag.
42. **Farm Mode** — quiet hours / outdoor-first; no fake check-ins.

### Anti-vibe-coded guards

43. **No Embeddings Cosplay** — ban mystery %; enumerable overlaps only.
44. **Signed Attestations** — optional prove-you-wrote-this.
45. **Deny is First-Class Exit** — ghosting disabled by design.

---

*Backlog append for draft PR #2. Docs-only; do not merge to main.*

---

## Feature forge v4 — even more diabolical

Another append-only wave. **25+ NEW** named features not already listed above. Ethical bounds unchanged: no stalking, doxxing, non-consensual scraping, shadow reputation, or harassment mechanics. Playful SWE-dark humor only.

### Observability / SRE dating

1. **SLI of Softness** — Agree 2–3 Service Level Indicators for the bond (reply latency bands, plan-keeping %, Busy accuracy). Private burn charts; page *yourself*, never publicly shame the other person.
2. **Error Budget for Ghosting** — Each person gets a monthly silence budget; exceeding it opens a blameless `incident` Issue instead of passive-aggressive unread receipts.
3. **On-Call Handshake** — After merge, declare who is “primary on-call” for planning this week (rotates). Clever: ownership of logistics without nagging spirals.
4. **Trace IDs for Plans** — Every Date Card gets a short `trace-id`; chat replies can reference it so context doesn’t fork into three half-plans.
5. **Saturation Alerts** — If chat WIP + open PRs + midterm Busy collide, the board shows `saturated` and refuses new Hotfix intake until you shed load.

### Security / threat-modeling consent

6. **STRIDE-the-Date** — Lightweight threat model checklist before first meet (Spoofing profiles, Tampering plans, Repudiation of consent, Info disclosure, DoS via spam reviews, Elevation via pressure). Both tick boxes; comedy with teeth.
7. **Consent Capability Tokens** — Explicit, revocable tokens for scopes: `share-photo`, `meet-off-campus`, `add-to-group-chat`. No scope → CTA disabled. Diabolical: OAuth for affection.
8. **Least-Privilege Bio** — Default profile shows minimum fields; each extra field is an opt-in grant with TTL. Clever: privacy as IAM, not a settings graveyard.
9. **Incident Response Runbook (Safety)** — One-tap runbook: share plan, check-in, block, report, export evidence pack. Same student safety rails, SRE-shaped.
10. **Signed Consent Receipts** — After both Accept a Date Card, store a private receipt of what was agreed (time/place/scope). Not public; anti-gaslight, not surveillance.

### Package managers / dependency love languages

11. **Love Language = Package Manager** — Declare `npm` (explicit lockfile), `cargo` (strict types/traits), `pip` (flexible but chaotic), `bazel` (hermetic routines). Matcher soft-boosts compatible install philosophies — enumerable, not embedding cosplay.
12. **Peer Dependency Negotiator** — When two lockfiles conflict (sleep vs late hack nights), UI opens a 3-way merge UI for *one* dependency at a time. No silent resentment installs.
13. **Optional Peer: Pets & Plants** — Optional deps you bring into shared space, declared up front. Clever: scope the household early without trap features.
14. **Yanked Version Notice** — If you deprecate an intent or boundary, dependents (active chats) get a yank notice + migration guide, not a sudden 404.

### Compiler / type-system flirting

15. **Strict Mode Courtship** — Opt into `strict: true`: intent, schedule, and pins must typecheck before you can open PRs. Diabolical: no `any` in your dating config.
16. **Protocol Witnesses** — Traits you implement (`AsyncCommunicator`, `ShowsUpOnTime`, `GivesDesignDocs`). Others can Request Changes if a witness is missing — still visible, still kind.
17. **Null Safety Nudge** — Empty “what I’m looking for” blocks Merge Train eligibility. Clever: `T?` without a default doesn’t ship.
18. **Exhaustive Match Intents** — Switching intent requires updating all open PRs (re-review or close). Compiler energy: no forgotten matches.

### Maintainer burnout empathy / OSS texture

19. **Maintainer Mode** — Status that throttles inbound PRs to 1/week and auto-replies with capacity RFC. Empathy for people who already review code all day.
20. **Triage Party (Two-Person)** — Weekly 25m to clear shared Issues (`good first meet`, `blocked on capacity`) together. Diabolical: relationship scrum without standup theater.
21. **Goodbye COMMIT Message** — Closing a chat requires a one-line commit subject (`chore: sunset thread — capacity`). Visible to both; dignified exit grammar.
22. **Support Window Banner** — Declare “I reply evenings only” as a maintainer support window on the profile diff. Soft expectation setting, not read-receipt police.

### Hackathon war stories / research dates

23. **War Story Gists** — Opt-in 300-char gists: TreeHacks sleep-floor saga, broken demo, glorious kludge. Taste signal via narrative, not trophy case.
24. **Journal Club Date** — Date Card template: pick one paper/RFC/blog, 45m discuss + 15m walk. Research kids get a first-class meet shape.
25. **Poster Session Mixer** — Soft campus-boosted, WIP-capped group night where each person brings one pin/README as a “poster.” No infinite mingle mode.
26. **Reproducibility Bond** — Pair tries to re-run each other’s pinned README in a sandboxed hour. Green if both get hello-world; badge is private to the pair.

### Music + code (livecoding)

27. **Algorave RSVP** — Opt-in interest tag + Date Card: attend/watch an algorave or livecoding set, or jam for 30m in Hydra/Tidal-ish tools. Arts×systems bridge.
28. **BPM Boundaries** — Shared playlist rate-limit: max one “listen to this” link/day unless both raise the cap. Diabolical: anti-spam as mixer etiquette.
29. **Duo Livecoding Slot** — Fork of pair-slot energy but audio/visual: 45m, both push a clip or gist. Distinct from kata; performance-shaped.

### Museum / comedy / multiplayer debugging

30. **Hall of Denied Diffs (Consensual Comedy)** — Opt-in museum where *you* can publish anonymized snippets of *your own* past Deny comments you’re proud of (wit without targeting). Never publishes someone else’s words without their release.
31. **Dungeon = Pair Debugging** — Co-op “quest”: a flaky test or toy bug in a shared repo; roles `driver`/`navigator`; clear the boss to unlock a Canary coffee. Multiplayer without gamified creepy XP.
32. **Boss Fight: Calendar Hydra** — Mini-ritual that collapses three proposed times into one via ranked choice. Clever: kills the scheduling hydra with a mechanic, not vibes.
33. **Spectator Mode (Friends)** — CODEOWNERS wingpeople can watch *your* triage board metrics (WIP, overdue train) with your consent — not read your DMs. Accountability without outing.

### Extra compiler/SRE spice (keep going)

34. **Hysteresis on Busy** — Exiting Busy has a cool-down before Walk-ins flood you (prevents flapping). SRE anti-flap for humans.
35. **Dead Letter Queue** — Expired Walk-ins and ignored Hotfixes land in a private DLQ you can replay once/week — still WIP-gated. No infinite revive swipe.
36. **Schema Migration Dates** — Big life changes (graduating, new lab, leaving The Farm) open a versioned migration PR to your profile with reviewer notes for active merges.
37. **Typed Throws for Conflict** — Conflict Issues must use typed reasons (`CapacityError`, `ValuesMismatchError`, `ScheduleConflictError`) — exhaustiveness over vague “we need to talk” voids.

---

## Cut list guidance

Ideation stays; this ranks what to **prototype first** vs park. Does **not** delete any forge/backlog item.

### Top 15 to prototype (near-term)

Ship enough to feel like SWEnder, not Tinder-with-monospace.

| Priority | Feature / system | Why prototype now |
|---|---|---|
| 1 | Courtship as PR + visible Accept / Request Changes / Deny | Locked core loop |
| 2 | Comment rubrics + CI reject rubber-stamps | Quality without moderation-only hope |
| 3 | Global WIP (max 3 open PRs) on Triage Board | Prevents infinite swipe reincarnation |
| 4 | Weekly Merge Train (Lane A) | Scarcity + cadence students can survive |
| 5 | GitHub link required + opt-in pins + light public basics on PR diff | Identity + taste without dossier creep |
| 6 | Office-Hours Walk-ins (Lane D) + Good First Issue openers | Availability-first, LaIR-shaped honesty |
| 7 | Review Tokens + LGTM Tax | Makes Accept expensive enough to be meaningful |
| 8 | Deny Requires a Patch Suggestion / first-class exit | Deny is grammar, ghosting is disabled |
| 9 | Date Card + Canary Deploy / Canary Date templates | Short reversible first meet |
| 10 | Busy / Merge Freeze / TreeHacks Freeze | Silence with dignity |
| 11 | Required Checks / Boundaries CI before deep chat | Consent + bounds before intensity |
| 12 | Museum of Closed PRs + Cold Storage Archive (private) | Learning without public shame |
| 13 | No Embeddings Cosplay + enumerable overlaps only | Anti–vibe-coded matching ethics |
| 14 | Safety runbook (share plan, check-in, block, report) | Non-negotiable with visible Denies |
| 15 | Campus soft boost + `.edu` / intent gates from student MVP | Keep student constraints wired in |

### Prototype soon after (still sharp, slightly heavier)

- Hotfix (Lane B) with star intersection / pin forage  
- Chaos / Blame-the-Algorithm (Lane C) opt-in  
- RFC Before Exclusive + Issue Templates for Conflict  
- Rollback / SEV Dating Postmortem  
- CODEOWNERS Wingpeople (suggest-only)  
- Strict Mode Courtship + Love Language = Package Manager (as *labels*, not ML)  
- Journal Club Date + War Story Gists  
- Consent Capability Tokens  

### Later / park (delightful but not blocking the loop)

- Shader Courtship, Algorave RSVP, Duo Livecoding, Generative Compat Seed  
- Dungeon = Pair Debugging, Hall of Denied Diffs (consensual comedy)  
- Monorepo Mode, Worktree Dates, Blue/Green Profiles, Feature Flag Affection  
- `~/.swenderrc`, `man swender-date`, ASCII/Terminal Gallery skins  
- Poster Session Mixer, Reproducibility Bond, Schema Migration Dates  
- Maintainer Mode polish, Support Window Banner, Spectator Mode  

### Explicitly do **not** prototype (even if spicy)

- Co-contributor / people-you-may-know graphs  
- Mystery % compatibility / embedding cosplay  
- Public reputation, leaderboards, or shadow elo  
- GPS trails, silent roster joins, non-consensual scraping  
- Any mechanic that hides Deny/Request Changes/Accept comments (visibility is locked)

---

*v4 forge + cut list append for draft PR #2. Docs-only; do not merge to main.*

---

## Feature forge v5 — terminal demons

Append-only wave of **20+ NEW** named features (checked against prior numbered names). Terminal/git intimacy with SWE-dark humor — still ethical: no stalking, doxxing, non-consensual scraping, shadow scores, or hidden review comments.

### Pager / tmux intimacy

1. **tmux Pair Session** — After merge, opt-in shared “session”: named windows for `plans`, `feelings`, `logistics`. Detaching is allowed; killing the session requires a visible commit message.
2. **split-pane Confessional** — Chat UI can split: left = logistics, right = feelings. Sending in the wrong pane nudges `wrong window`. Clever: context switching as care.
3. **less +F Listening Mode** — When someone marks Busy, your chat becomes follow-mode: you can queue messages that deliver when they leave Busy (no push spam). Diabolical pager patience.
4. **Scrollback Consent** — Long threads paginate; jumping to ancient scrollback requires a `/jump` with reason. Anti-dredge without deleting history.
5. **Status-Bar Affection** — Tiny shared status line (`WIP=2`, `next: Thu coffee`, `Busy until Fri`). Not a public presence graph — pair-only HUD.

### Git hooks as consent hooks

6. **pre-commit Consent Hook** — Before sending a Date Card, local checklist hook: place public? exit plan? shared transport? Block send until green.
7. **pre-push Boundary Hook** — Raising chat intensity (late-night call ask, off-campus) runs a consent capability check; missing scope → hook fails with actionable grant request.
8. **commit-msg Kindness Lint** — Review comments failing basic kindness/blocklist fail the hook before visibility — still doesn’t hide successful Denies.
9. **post-merge Aftercare Hook** — On mutual Accept, prompts a 3-bullet aftercare template (communication SLO, Busy norms, kill switch). Optional but sticky once enabled.

### Monorepo jealousy (named, contained)

10. **Monorepo Jealousy Diff** — If you feel sidelined by their other packages (lab, team, ex-thread archive), open a typed Issue `JealousyDiff` with hunks — no reading their other DMs; structured confession.
11. **CODEOWNERS Envy Map** — Opt-in map of which life packages have owners (you / them / shared). Jealousy becomes a ownership conversation, not surveillance.
12. **Workspace Boundary** — Declare packages that are `private` (not discussable) vs `reviewable`. Crossing into private without invite is a lint error in prompts.

### SPDX love licenses / SBOM emotions

13. **SPDX Love License** — Choose a relationship license string (`SWENDER-EXCLUSIVE-1.0`, `SWENDER-NONEXCLUSIVE-CASUAL-1.0`, `SWENDER-FRIENDS-FIRST-1.0`) with human-readable rights/obligations. DTR with SPDX energy.
14. **License Compatibility Matrix** — Soft warning when license strings conflict (exclusive vs casual). Enumerable table — no mystery %.
15. **SBOM of Emotional Dependencies** — List what you currently depend on (therapist, lab deadline, family weekly call, meds routine) as an Emotional Bill of Materials. Partners see load, not gossip graph.
16. **Vulnerability Disclosure (Feelings)** — Private `security@`-style channel between the pair for “I felt unsafe / disrespected” reports with SLA — distinct from public moderation.

### Fuzzing / property-based testing

17. **Boundary Fuzzer** — Opt-in weekly prompts that gently probe edge cases you both listed as fuzzy (`texts after 11pm?`, `surprises ok?`). Findings file as Issues, not traps.
18. **Property-Based Relationship Testing** — Declare invariants (`shows_up ∨ cancels_with_2h`, `no_silent_treatment > 48h without Busy`). Counterexamples open blameless tickets.
19. **Generator of Good First Dates** — Property generator suggests Date Cards from pinned constraints (distance, budget, sensory load). Reject/Accept as test oracles.
20. **Shrinking a Fight** — Conflict helper that shrinks a huge argument to the minimal failing example (one sentence each). Diabolical: `shrink` until the real bug shows.

### Rebase vs merge / bisect / cherry-pick / stash / submodules

21. **Rebase vs Merge Philosophy Date** — Date Card template: 45m argue/celebrate whether you rewrite history or preserve it — then apply the metaphor to conflict style. No wrong answer; visible takeaways.
22. **Bisecting a Breakup** — When sunsetting, optional guided bisect over the thread’s tagged milestones to find the first bad commit *together* (blameless). Distinct from Bisect Night (taste history).
23. **Cherry-Pick Compliments** — UI to cherry-pick a specific message/commit from the week and pin it to a `COMPLIMENTS.md`. Low-cost affection with provenance.
24. **stash pop Anxiety** — If you `stash` feelings (private notes) longer than N days, gentle prompt before `pop` (share or discard). Names the dread of sudden emotional dumps.
25. **Submodule Attachment Style** — Attachment framed as submodule strategy: `pinned commit` (predictable), `tracking branch` (follows main), `init=false` (needs explicit invite). Comedy + clarity; not armchair diagnosis as score.
26. **git submodule update --remote Ritual** — Quarterly check-in PR: update expectations to HEAD with changelog. Missed updates don’t auto-punish; they open a sync Issue.
27. **Detached HEAD Evening** — Opt-in “no future talk” hangout mode: present-only, no DTR. Clever: detached HEAD as consensual lightness.
28. **Abort Merge Safe Word** — Either person can `git merge --abort` a fight mid-thread: pause timers, no scorekeeping, mandatory water/break checklist before retry.

---

*v5 terminal demons append for draft PR #2. Docs-only; do not merge to main.*
