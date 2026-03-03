# Difficulty Scaling Specification

## Purpose

Define how INTERROGATE adjusts challenge over time so difficulty feels fair, learnable, and deterministic.

## Design Goals

- Increase cognitive load as player mastery improves.
- Avoid random spikes that feel unearned.
- Recover struggling players without removing core tension.
- Keep scaling reproducible from gameplay logs and seed data.

## Scope

This spec controls:

- Tier selection per case.
- Dynamic modifiers within a case.
- Promotion and demotion rules across cases.
- Guardrails preventing unwinnable states.

This spec does not control:

- Core turn resolution logic.
- Timer engine internals.
- Score math internals.

## Core Concepts

| Term | Definition |
| --- | --- |
| `tier` | Discrete case difficulty band (`1` to `4`). |
| `difficulty_index` | Continuous value `0` to `100` derived from tier and modifiers. |
| `dynamic_modifier` | Temporary within-case modifier applied to next statements. |
| `profile_modifier` | Persistent player modifier derived from recent case history. |
| `recoverable_turn` | Intentionally easier turn injected after major penalties. |

## Inputs

| Input | Window | Source |
| --- | --- | --- |
| `rolling_accuracy_10` | Last 10 resolved turns | Core loop resolver |
| `false_accusation_rate_10` | Last 10 resolved turns | Core loop resolver |
| `avg_decision_ratio_10` | Last 10 resolved turns | Timer + input timestamps |
| `recent_case_grades` | Last 5 cases | Scoring system |
| `recent_hard_fail_count` | Last 3 cases | Core loop terminal state |
| `trust_end_pct` | Current/last case end | Core loop trust system |

## Outputs

| Output | Target System |
| --- | --- |
| `effective_statement_ms` multiplier | Timer system |
| Lie subtlety level | Case content selector |
| Contradiction depth cap | Case content selector |
| Suspect count target | Case generator |
| Tier promotion/demotion event | Progression/profile manager |

## Tier Baseline Model

| Tier | Baseline Difficulty Index | Suspects | Lie Pattern Profile | Statement Timer Range |
| --- | --- | --- | --- | --- |
| `1` | `20` | `1` | Direct contradictions, explicit anchors | `3000-3500 ms` |
| `2` | `45` | `2` | Timeline inconsistencies, light cross-reference | `2200-2800 ms` |
| `3` | `70` | `3` | Cross-suspect conflicts, partial truths begin | `1600-2200 ms` |
| `4` | `90` | `3+` | Dense contradiction chains, mixed omissions | `1200-1800 ms` |

## Difficulty Index Formula

```txt
difficulty_index =
  clamp(
    tier_baseline_index + profile_modifier + dynamic_modifier,
    0,
    100
  )
```

Default bounds:

- `profile_modifier` range: `-12` to `+12`
- `dynamic_modifier` range: `-15` to `+15`

## In-Case Dynamic Scaling Rules

Update `dynamic_modifier` after each resolved turn.

### Primary Rules

- If `rolling_accuracy_10 >= 85` then apply `dynamic_modifier += 5`.
- If `rolling_accuracy_10 <= 60` then apply `dynamic_modifier -= 6`.
- If `false_accusation_rate_10 >= 40` then apply `dynamic_modifier -= 3`.
- If `avg_decision_ratio_10 <= 0.35` and `rolling_accuracy_10 >= 75` then apply `dynamic_modifier += 2`.

### Applied Timer Adjustment

For the next statement:

- If `rolling_accuracy_10 >= 85`, reduce statement timer by `5%`.
- If `rolling_accuracy_10 <= 60`, increase statement timer by `8%`.
- Apply trust pressure modifier from `timer.spec.md` after dynamic adjustment and before clamp.

These percentages must match `core-loop.spec.md`.

### Clamp Rule

- Clamp `dynamic_modifier` to `[-15, +15]` after each update.

## Cross-Case Progression Rules

### Promotion

Promote tier by `+1` when all are true:

- Two consecutive case clears.
- Both case grades are `B` or higher.
- End trust is `>= 25%` in the most recent cleared case.

### Demotion

Demote tier by `-1` when any are true:

- Two consecutive hard failures.
- Three consecutive cases graded `D`.
- Three consecutive cases with `accuracy < 60%`.

### Tier Bounds

- Minimum tier: `1`
- Maximum tier: `4`

### Onboarding Lock

- First two completed cases are locked to tier `1`.
- Dynamic in-case scaling still applies during onboarding lock.

## Content Complexity Mapping

Map `difficulty_index` to content knobs:

| Difficulty Index Band | Lie Subtlety | Contradiction Distance | Advanced Lie Types |
| --- | --- | --- | --- |
| `0-30` | Low | Same or adjacent turns | Disabled |
| `31-55` | Medium-low | Up to 2 turns apart | Rare |
| `56-75` | Medium-high | Up to 3 turns apart | Enabled |
| `76-100` | High | Up to 4 turns apart | Frequent |

## Recoverability Rules

- After any major penalty event, force one recoverable turn.
- Major penalty events include false accusations that cause major trust drops, or consecutive incorrect outcomes while in critical trust.
- Recoverable turns must prefer direct contradiction patterns.
- Recoverable turns must add `+10%` statement time relative to the computed value.
- Do not chain more than one recoverable turn unless the player makes another major mistake.

## Global Guardrails

- Never reduce statement timer below `1000 ms`.
- Never exceed statement timer above tier maximum plus 15%.
- Before tier `4`, never chain more than two advanced lie types consecutively.
- Ensure at least one logically detectable lie every three turns.
- Do not increase more than one complexity knob in the same turn update when player is already in critical trust.

## Mode Overrides

| Mode | Scaling Behavior |
| --- | --- |
| Standard Case | Full dynamic + progression scaling |
| Daily Challenge | Fixed seed and fixed difficulty profile; no profile-based tier changes |
| Endless | Dynamic scaling enabled; tier can float by difficulty index bands |
| Tutorial | Tier forced to `1`; advanced lie types disabled |

## Determinism Rules

- Scaling decisions are evaluated only at turn resolution boundaries.
- Given same seed and same turn outcomes, scaling outputs must be identical.
- Random selection of lie templates must consume deterministic RNG calls in fixed order.

## Configuration Defaults

| Key | Default |
| --- | --- |
| `difficulty.min_tier` | `1` |
| `difficulty.max_tier` | `4` |
| `difficulty.profile_modifier_min` | `-12` |
| `difficulty.profile_modifier_max` | `12` |
| `difficulty.dynamic_modifier_min` | `-15` |
| `difficulty.dynamic_modifier_max` | `15` |
| `difficulty.promote_streak_required` | `2` |
| `difficulty.demote_hard_fail_streak` | `2` |
| `difficulty.demote_low_grade_streak` | `3` |
| `difficulty.high_accuracy_threshold` | `85` |
| `difficulty.low_accuracy_threshold` | `60` |
| `difficulty.high_accuracy_timer_reduction_pct` | `5` |
| `difficulty.low_accuracy_timer_increase_pct` | `8` |
| `difficulty.recoverable_turn_timer_bonus_pct` | `10` |

## Telemetry Events

- `difficulty.turn_adjusted`
- `difficulty.case_tier_changed`
- `difficulty.recoverable_turn_injected`
- `difficulty.mode_override_applied`

Required fields:

- `case_id`
- `turn_index`
- `tier_before`
- `tier_after`
- `difficulty_index`
- `dynamic_modifier`
- `profile_modifier`
- `rolling_accuracy_10`
- `false_accusation_rate_10`
- `effective_statement_ms`

## Acceptance Criteria

- Timer adjustments match thresholds defined in `core-loop.spec.md`.
- Tier promotion occurs only when promotion conditions are fully met.
- Tier demotion occurs exactly on configured streak boundaries.
- Difficulty index always remains in `0-100`.
- Guardrail constraints prevent invalid timer and lie-chain configurations.
- Replaying identical logs produces identical scaling decisions.
