# ADR 0001: Vertical Slice Definition

- Status: Accepted
- Date: 2026-03-03
- Related: `plans/vertical-slice.plan.md`

## Context

The project has product and system specs, but delivery risk remains high without a strict first milestone boundary. Without a formal definition, scope can expand into campaign systems, platform features, and polish work before the core loop is proven.

The team needs one explicit decision that defines:

- What must exist to call the game playable.
- What is intentionally excluded from the first milestone.
- What polish work is intentionally deferred.

## Decision

Adopt a vertical-slice-first delivery strategy with the scope defined in `plans/vertical-slice.plan.md`.

The vertical slice is considered complete only when:

- The full case loop is playable end to end (`CASE_BRIEF -> STATEMENT_ACTIVE -> RESOLUTION -> CASE_SUCCESS/CASE_FAILURE`).
- Core systems are integrated and functional (input, timers, trust/progress, scoring, baseline difficulty scaling, minimal readable UI, deterministic replay behavior).
- A player can complete a case (win or fail) and see clear outcome feedback.

The vertical slice explicitly excludes:

- Campaign and multi-case narrative progression.
- Endless/daily publishing flow and leaderboard backend integration.
- Cloud/account systems, localization, and advanced behavior-tell features.
- Full economy/achievement systems and content authoring UI.

The vertical slice intentionally ignores polish outside functional quality:

- Final art/audio polish and cinematic presentation.
- Advanced accessibility and platform-specific tuning beyond baseline support.
- Broad balance optimization outside slice validation needs.

## Consequences

Positive consequences:

- Reduces delivery risk by forcing early proof of core gameplay viability.
- Enables faster playtesting and balancing with a stable, limited scope.
- Creates a clear "done" gate for milestone completion and go/no-go decisions.

Negative consequences:

- The first playable build will feel incomplete in presentation and feature breadth.
- Some deferred systems may require rework when integrated later.
- Stakeholders must align on progress being measured by loop quality, not content volume.

Follow-up consequences:

- Backlog and roadmap items outside this scope remain tracked but are non-blocking for slice completion.
- New feature requests that exceed slice boundaries require a new ADR or explicit scope change approval.
