# Vertical Slice Tasks

## Execution Rules

- Every task must be independently testable before merge.
- Every task must be mergeable in isolation.
- Every task must avoid multi-system coupling.
- Use interface stubs or mocked data when a dependency is not implemented yet.

## Task List

### VS-001 Implement Game State Enum

- Status: `Todo`
- Deliverable: `GameState` enum/constants with `PRE_CASE`, `CASE_BRIEF`, `STATEMENT_ACTIVE`, `RESOLUTION`, `CASE_SUCCESS`, `CASE_FAILURE`, `PAUSED`.
- Scope boundary: constants only; no transition logic.
- Test: unit test verifies all expected state keys exist and are immutable.
- Merge condition: no runtime behavior changes outside state constant import points.

### VS-002 Implement Countdown Timer Module

- Status: `Todo`
- Deliverable: timer module with start, stop, pause, resume, reset, and expiry callback.
- Scope boundary: timer behavior only; no game-state decision logic.
- Test: unit tests for decrement, pause/resume correctness, single expiry emission, and clamp at zero.
- Merge condition: module can run with mocked callbacks and no DOM dependency.

### VS-003 Implement Instruction Generator

- Status: `Todo`
- Deliverable: instruction/statement provider that returns current statement text and truth flag from seeded/static case data.
- Scope boundary: content retrieval only; no scoring or trust mutation.
- Test: unit tests verify deterministic statement order for a fixed seed/data set.
- Merge condition: no timer/input dependencies required.

### VS-004 Implement Input Handler

- Status: `Todo`
- Deliverable: input module handling `ACCUSE`, timeout-as-`NO_INPUT`, and pause/resume signals.
- Scope boundary: capture and normalize input events only; no outcome evaluation.
- Test: unit tests for one-action-per-turn lock and ignored inputs in disallowed states.
- Merge condition: works with mocked game state and mocked callbacks.

### VS-005 Implement Evaluation Logic

- Status: `Todo`
- Deliverable: pure evaluator that maps `(player_action, statement_truth)` to outcome (`correct accusation`, `correct restraint`, `false accusation`, `missed lie`).
- Scope boundary: outcome resolution only; no scoring math, no UI.
- Test: table-driven unit tests cover all outcome matrix combinations.
- Merge condition: pure function with no side effects.

### VS-006 Implement Scoring System

- Status: `Todo`
- Deliverable: scoring module for outcome points, time bonus, streak multiplier, and running total.
- Scope boundary: score math only; no failure or state transition handling.
- Test: unit tests for boundary values, streak thresholds, and non-negative final clamp.
- Merge condition: pure or near-pure API callable from mocked turn logs.

### VS-007 Implement Failure State Rules

- Status: `Todo`
- Deliverable: failure checker for `trust <= 0` and case-timeout-with-insufficient-evidence.
- Scope boundary: failure decision only; no restart/reset flow.
- Test: unit tests for both fail paths and no-fail controls.
- Merge condition: callable as a pure check function with input snapshot object.

### VS-008 Implement Restart Flow

- Status: `Todo`
- Deliverable: reset routine that returns runtime to `CASE_BRIEF` with clean trust/progress/timers/turn index.
- Scope boundary: reset orchestration only; no scoring or UI animation effects.
- Test: integration test verifies a failed run can restart and begin a fresh case.
- Merge condition: no dependency on advanced persistence.

### VS-009 Add Basic UI Feedback

- Status: `Todo`
- Deliverable: minimal DOM feedback for statement text, timer, outcome message, trust/progress values, and end-state message.
- Scope boundary: baseline readability only; no high-fidelity animation/polish.
- Test: manual smoke test and basic DOM assertion test for each core outcome message path.
- Merge condition: UI reads from existing state/output contracts without introducing new game rules.

## Recommended Merge Order

1. VS-001
2. VS-002
3. VS-003
4. VS-004
5. VS-005
6. VS-006
7. VS-007
8. VS-008
9. VS-009
