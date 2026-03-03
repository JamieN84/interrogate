# Scoring System Specification

## Purpose

Define how player performance is converted into score, grade, and leaderboard eligibility in INTERROGATE.

## Design Goals

- Reward correct detection and disciplined restraint.
- Penalize false accusations more than missed lies to discourage random guessing.
- Preserve transparency so players can understand why they scored high or low.
- Keep score deterministic and reproducible from turn logs.

## Score Components

| Component | Symbol | Source |
| --- | --- | --- |
| Outcome points | `outcome_points` | Turn result type |
| Time bonus | `time_bonus` | Remaining statement time |
| Streak multiplier | `streak_mult` | Consecutive correct outcomes |
| Case clear bonus | `case_clear_bonus` | Case success only |
| Trust bonus | `trust_bonus` | Trust remaining at case end |
| Failure penalty | `failure_penalty` | Hard failure only |

## Turn Outcome Points

| Turn Outcome | Points |
| --- | --- |
| Correct accusation (`accuse + lie`) | `+100` |
| Correct restraint (`accept + truth`) | `+40` |
| False accusation (`accuse + truth`) | `-120` |
| Missed lie (`accept + lie`) | `-80` |

## Time Bonus Rules

- Time bonus applies only to correct outcomes.
- Bonus range is `0` to `30` points.
- Formula:

```txt
time_bonus = floor((remaining_statement_ms / statement_start_ms) * 30)
```

- Clamp to `[0, 30]`.
- If outcome is incorrect, `time_bonus = 0`.

## Streak Multiplier Rules

### Correct Outcome Definition

- A "correct outcome" is either `correct accusation` or `correct restraint`.

### Multiplier Table

| Consecutive Correct Outcomes | Multiplier |
| --- | --- |
| `0-2` | `x1.00` |
| `3-5` | `x1.10` |
| `6-9` | `x1.25` |
| `10+` | `x1.50` |

### Reset Conditions

- Any incorrect outcome resets streak to `0`.
- Hard fail resets streak and does not carry to next case.

## Turn Score Formula

```txt
turn_raw = outcome_points + time_bonus
turn_score = round(turn_raw * streak_mult)
```

Rules:

- `streak_mult` is evaluated after applying current turn outcome to streak count.
- Round to nearest integer, halves away from zero.

## Case Score Formula

```txt
case_score =
  max(
    0,
    sum(turn_score) + case_clear_bonus + trust_bonus - failure_penalty
  )
```

Default values:

- `case_clear_bonus = 500` on success, otherwise `0`.
- `trust_bonus = trust_remaining * 5` (success only).
- `failure_penalty = 250` on hard failure, otherwise `0`.

## Accuracy and Grade Rules

### Accuracy Formula

```txt
accuracy_pct = (correct_outcomes / total_resolved_statements) * 100
```

### Grade Thresholds

| Grade | Requirement |
| --- | --- |
| `S` | Accuracy >= 90% and trust >= 40% |
| `A` | Accuracy >= 80% |
| `B` | Accuracy >= 70% |
| `C` | Accuracy >= 60% |
| `D` | Accuracy < 60% |

### Grade Notes

- If `S` trust requirement is not met, downgrade to `A` if `A` threshold is met.
- Grades are assigned on case end only.

## Failure and Scoring Interactions

| Condition | Score Effect |
| --- | --- |
| Hard failure (`trust <= 0` or timeout with insufficient evidence) | Apply `failure_penalty` |
| Soft failure (low grade, case solved) | No hard penalty; lower score naturally from poor outcomes |
| Case success | Apply clear and trust bonuses |

## Leaderboard Eligibility Rules

A case result is eligible for leaderboard submission only if all are true:

- Case ended in `CASE_SUCCESS`.
- False accusations are `<= max_false_accusations_for_leaderboard`.
- No debug/assist modifiers are enabled.
- Deterministic seed and scoring ruleset version are valid.

Default:

- `max_false_accusations_for_leaderboard = 5`

## Tie-Breaking Rules

When two runs have equal `case_score`, rank by:

1. Higher `accuracy_pct`
2. Higher `trust_remaining`
3. Lower `case_completion_time_ms`
4. Earlier completion timestamp

## Configuration Defaults

| Key | Default |
| --- | --- |
| `scoring.correct_accusation_points` | `100` |
| `scoring.correct_restraint_points` | `40` |
| `scoring.false_accusation_points` | `-120` |
| `scoring.missed_lie_points` | `-80` |
| `scoring.time_bonus_max` | `30` |
| `scoring.streak_3_mult` | `1.10` |
| `scoring.streak_6_mult` | `1.25` |
| `scoring.streak_10_mult` | `1.50` |
| `scoring.case_clear_bonus` | `500` |
| `scoring.trust_bonus_per_point` | `5` |
| `scoring.failure_penalty` | `250` |

## Telemetry Events

Emit these events for balancing and auditability:

- `scoring.turn_resolved`
- `scoring.streak_changed`
- `scoring.case_finalized`
- `scoring.leaderboard_eligibility_evaluated`

Required event fields:

- `case_id`
- `turn_index`
- `outcome_type`
- `outcome_points`
- `time_bonus`
- `streak_count`
- `streak_mult`
- `turn_score`
- `running_case_score`
- `accuracy_pct`

## Acceptance Criteria

- Given identical turn logs, final score is identical across runs.
- Incorrect outcomes never receive time bonus.
- Multiplier thresholds apply exactly at 3, 6, and 10 consecutive correct outcomes.
- Grade output matches threshold table for all boundary values.
- Leaderboard rejection occurs when false accusations exceed configured cap.
- Final case score is never negative.
