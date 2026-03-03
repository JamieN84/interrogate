# Core Loop Specification

## Game States

### State List

| State | Purpose |
| --- | --- |
| `PRE_CASE` | Load case seed, statements, and truth map. |
| `CASE_BRIEF` | Show context and known facts before play starts. |
| `STATEMENT_ACTIVE` | Present one statement and accept a decision. |
| `RESOLUTION` | Evaluate action and apply trust/progress/score changes. |
| `CASE_SUCCESS` | Terminal success screen with results. |
| `CASE_FAILURE` | Terminal failure screen with fail reason. |
| `PAUSED` | Suspend active timers and gameplay input. |

### State Transitions

| From | Trigger | To |
| --- | --- | --- |
| `PRE_CASE` | Case data ready | `CASE_BRIEF` |
| `CASE_BRIEF` | Player starts case | `STATEMENT_ACTIVE` |
| `STATEMENT_ACTIVE` | Player accuses OR statement timer expires | `RESOLUTION` |
| `RESOLUTION` | `evidence_progress >= evidence_required` | `CASE_SUCCESS` |
| `RESOLUTION` | `trust <= 0` OR timed-out case with insufficient evidence | `CASE_FAILURE` |
| `RESOLUTION` | More statements and no hard fail | `STATEMENT_ACTIVE` |
| Any non-terminal state | Pause input | `PAUSED` |
| `PAUSED` | Resume input | Previous non-terminal state |

### Success State

- Enter `CASE_SUCCESS` when required evidence is reached.
- Stop active gameplay timers.
- Show score, grade, and replay/continue actions.

### Failure State

- Enter `CASE_FAILURE` when any hard failure condition is met.
- Stop active gameplay timers.
- Show primary fail reason and restart action.

## Player Inputs

| Input | Allowed In | Effect |
| --- | --- | --- |
| `ACCUSE` | `STATEMENT_ACTIVE` | Marks current statement as lie and resolves turn immediately. |
| `NO_INPUT` | `STATEMENT_ACTIVE` | Implicitly accepts statement as truth when timer expires. |
| `PAUSE` | Any non-terminal state | Transitions to `PAUSED`. |
| `RESUME` | `PAUSED` | Returns to previous active state. |

### Input Rules

- Exactly one decision is allowed per statement.
- Inputs after turn resolution are ignored.
- Optional input buffer of 100 ms is allowed before timer visibly starts.

## Timer Behaviour

### Timer Types

| Timer | Scope | Notes |
| --- | --- | --- |
| `statement_timer` | Per statement | Main decision window. |
| `case_timer` | Per case (timed modes) | Global budget for the entire case. |
| `resolution_timer` | Per resolution | 0.6 to 0.8 second feedback lock window. |

### What Happens Every Second

During `STATEMENT_ACTIVE`, process this sequence each elapsed second:

1. Decrease `statement_timer` by 1 second (or equivalent real-time delta).
2. Decrease `case_timer` by 1 second when timed mode is enabled.
3. Update urgency tier (`normal`, `warning`, `critical`) from timer thresholds.
4. If `statement_timer <= 0`, commit `NO_INPUT` and transition to `RESOLUTION`.
5. If `case_timer <= 0`, finish current resolution, then fail if evidence is below target.

### Threshold Defaults

- Statement warning: 40% time remaining.
- Statement critical: 15% time remaining.
- Case warning: 25% time remaining.
- Case critical: 10% time remaining.
- Low trust may further compress upcoming statement timers per `timer.spec.md`.

## Instruction Rules

### Statement Construction Rules

- Each case uses an ordered statement queue with predefined truth values.
- Statement categories in MVP are `Truthful`, `Direct lie`, and `Partial truth` (advanced tiers only).
- Every lie must map to a contradiction against known facts or prior statements.

### What the Player Can Do

- Decide once per statement: accuse or accept.
- Use case facts and memory of prior statements to infer contradictions.
- Manage risk: aggressive accusing increases failure risk through trust loss.

### What the System Evaluates

For each resolved statement, evaluate:

- `player_action` (`accuse` or `accept`)
- `statement_truth` (`lie` or `truth`)
- `time_remaining` and urgency tier
- Current `trust`, `evidence_progress`, and `case_timer`

### Turn Outcome Matrix

| Player Action | Statement Truth | Outcome |
| --- | --- | --- |
| `accuse` | `lie` | Correct accusation |
| `accuse` | `truth` | False accusation |
| `accept` | `lie` | Missed lie |
| `accept` | `truth` | Correct restraint |

## Scoring Rules

### Per-Turn Score

| Outcome | Points |
| --- | --- |
| Correct accusation | `+100` |
| Correct restraint | `+40` |
| False accusation | `-120` |
| Missed lie | `-80` |
| Time bonus on correct actions | `+0` to `+30` |

### Streak Multipliers

- 3 correct outcomes in a row: `x1.10`
- 6 correct outcomes in a row: `x1.25`
- 10 correct outcomes in a row: `x1.50`
- Any incorrect outcome resets streak to 0.

### End-of-Case Grade

- `S`: accuracy >= 90% and trust >= 40%
- `A`: accuracy >= 80%
- `B`: accuracy >= 70%
- `C`: accuracy >= 60%
- `D`: accuracy < 60%

## Failure Rules

### Hard Failure Rules

Case fails immediately when any condition is true:

- `trust <= 0`
- `case_timer <= 0` and `evidence_progress < evidence_required`
- Optional challenge rule: scripted critical error triggered

### Soft Failure Rules

- Case solved with low performance grade (`C` or lower).
- Score and progression rewards are reduced by accuracy penalties.
- Leaderboard entry is blocked if false accusations exceed configured cap.

### Failure Feedback Rules

- Show one primary fail reason first.
- Show one actionable hint category from this set: `Over-accusing`, `Missing contradictions`, `Slow decisions`.

## Difficulty Scaling

### Tier Targets

| Tier | Core Pattern | Statement Timer |
| --- | --- | --- |
| `Tier 1 (Intro)` | 1 suspect, direct contradictions | 3.0 to 3.5 s |
| `Tier 2 (Standard)` | 2 suspects, timeline inconsistencies | 2.2 to 2.8 s |
| `Tier 3 (Advanced)` | 3 suspects, cross-suspect conflicts | 1.6 to 2.2 s |
| `Tier 4 (Expert)` | Partial truths and dense contradiction chains | 1.2 to 1.8 s |

### Dynamic Scaling Rules

- If recent 10-turn accuracy >= 85%, reduce next statement timer by 5% and increase lie subtlety by one step.
- If recent 10-turn accuracy <= 60%, increase next statement timer by 8% and prefer direct contradictions for next two turns.

### Scaling Guardrails

- Never reduce statement timer below 1.0 second.
- Before Tier 4, never chain more than two advanced lie types in a row.
- Always keep at least one recoverable turn after major penalty events.
