# Timer System Specification

## Purpose

Define how all gameplay timers behave in INTERROGATE so turn resolution, pressure pacing, and failure checks are deterministic and consistent across platforms.

## Timer Inventory

| Timer ID | Scope | Required | Default |
| --- | --- | --- | --- |
| `statement_timer` | Current statement turn | Yes | Tier based |
| `case_timer` | Full case duration | Timed modes only | Mode based |
| `resolution_timer` | Post-turn feedback lock | Yes | 700 ms |
| `input_buffer_window` | Pre-start input grace window | Optional | 100 ms |

## Timer Units and Source of Truth

- Internal unit: integer milliseconds.
- Display unit: seconds with one decimal precision.
- Update source: engine frame delta (`delta_ms`) with fixed-step safe handling.
- Rule: gameplay logic uses internal milliseconds only; UI formatting never drives logic.

## Timer State Model

Each timer has one of four states:

| State | Meaning |
| --- | --- |
| `IDLE` | Allocated but not counting down. |
| `RUNNING` | Decrementing each update tick. |
| `PAUSED` | Frozen value, no decrement. |
| `EXPIRED` | Reached zero and emitted expiry event. |

### Generic Timer Rules

- Timer values are clamped to `>= 0`.
- A timer can emit its expiry event once per start cycle.
- Restarting a timer always resets `state = RUNNING` and `expired_emitted = false`.

## Lifecycle by Game State

| Game State | statement_timer | case_timer | resolution_timer |
| --- | --- | --- | --- |
| `PRE_CASE` | `IDLE` | `IDLE` | `IDLE` |
| `CASE_BRIEF` | `IDLE` | `IDLE` | `IDLE` |
| `STATEMENT_ACTIVE` | `RUNNING` | `RUNNING` if enabled | `IDLE` |
| `RESOLUTION` | `IDLE` | `RUNNING` if enabled | `RUNNING` |
| `PAUSED` | `PAUSED` if active | `PAUSED` if active | `PAUSED` if active |
| `CASE_SUCCESS` | `EXPIRED/IDLE` | `EXPIRED/IDLE` | `EXPIRED/IDLE` |
| `CASE_FAILURE` | `EXPIRED/IDLE` | `EXPIRED/IDLE` | `EXPIRED/IDLE` |

## Statement Timer Specification

### Initialization

`statement_timer_ms` is set at turn start from this formula:

```txt
effective_statement_ms =
  clamp(
    base_tier_ms * dynamic_accuracy_modifier * trust_pressure_modifier,
    min_statement_ms,
    max_statement_ms
  )
```

Default bounds:

- `min_statement_ms = 1000`
- `max_statement_ms = 3500`

### Trust Pressure Modifier

`trust_pressure_modifier` is derived from trust at statement start:

| Trust Remaining | Modifier |
| --- | --- |
| `> 40%` | `1.00` |
| `> 20% and <= 40%` | `0.95` |
| `<= 20%` | `0.90` |

Application order:

1. Apply base tier value.
2. Apply dynamic accuracy modifier.
3. Apply trust pressure modifier.
4. Clamp to global min/max statement time.

### Base Tier Values

| Tier | Base Statement Time |
| --- | --- |
| `Tier 1` | 3000-3500 ms |
| `Tier 2` | 2200-2800 ms |
| `Tier 3` | 1600-2200 ms |
| `Tier 4` | 1200-1800 ms |

### Expiry Behavior

When `statement_timer_ms` reaches `0` during `STATEMENT_ACTIVE`:

1. Mark timer `EXPIRED`.
2. Commit implicit player action `NO_INPUT`.
3. Queue transition to `RESOLUTION`.
4. Prevent further gameplay input for that turn.

## Case Timer Specification

### Enablement

- Enabled only for timed modes and challenge variants.
- Disabled modes store `case_timer_enabled = false` and skip all case timeout checks.

### Expiry Behavior

When `case_timer_ms` reaches `0`:

1. Mark case timer `EXPIRED`.
2. Allow active statement to resolve normally.
3. After resolution, if `evidence_progress >= evidence_required` finish as success; otherwise transition to `CASE_FAILURE` with reason `CASE_TIMEOUT`.

## Resolution Timer Specification

### Purpose

Hold a brief lock period after turn evaluation so feedback is readable and accidental carry input is ignored.

### Rules

- Starts at entry to `RESOLUTION`.
- Default duration: `700 ms` (allowed range `600-800 ms`).
- Ignores gameplay decision input while running.
- On expiry, transition by priority: hard fail to `CASE_FAILURE`, else success to `CASE_SUCCESS`, else next `STATEMENT_ACTIVE`.

## Update Loop Behavior

### Per-Frame Update

For each timer in `RUNNING`:

1. `remaining_ms = max(0, remaining_ms - delta_ms)`
2. If `remaining_ms == 0` and `expired_emitted == false`, emit timer-specific expiry event.
3. Set `expired_emitted = true` and `state = EXPIRED`.

### Every-Second Event

The timer manager publishes a 1 Hz snapshot event while case is active:

- `statement_seconds_remaining`
- `case_seconds_remaining` (if enabled)
- `urgency_tier`

This event drives analytics and optional UI pulse timing; core logic still runs per frame.

## Urgency Threshold Rules

### Statement Urgency

| Threshold | Condition |
| --- | --- |
| `NORMAL` | > 40% time remaining |
| `WARNING` | <= 40% and > 15% |
| `CRITICAL` | <= 15% |

### Case Urgency

| Threshold | Condition |
| --- | --- |
| `NORMAL` | > 25% time remaining |
| `WARNING` | <= 25% and > 10% |
| `CRITICAL` | <= 10% |

## Pause and Resume Rules

- On `PAUSE`, all `RUNNING` timers transition to `PAUSED` with remaining values preserved.
- On `RESUME`, previously paused timers return to `RUNNING`.
- No timer may decrement while game is in `PAUSED`.
- Audio urgency cues must also pause to keep pressure fair.

## Input and Timer Race Conditions

When player input and timer expiry occur in the same frame:

1. Prefer explicit player input if its timestamp is `<= statement_expiry_timestamp`.
2. Otherwise treat as timeout (`NO_INPUT`).
3. Log resolution type as `INPUT_WON_RACE` or `TIMEOUT_WON_RACE` for debugging.

## Configuration Defaults

| Key | Default | Notes |
| --- | --- | --- |
| `timer.min_statement_ms` | `1000` | Global hard floor |
| `timer.max_statement_ms` | `3500` | Global hard cap |
| `timer.resolution_ms` | `700` | Feedback lock window |
| `timer.input_buffer_ms` | `100` | Optional anti-frustration buffer |
| `timer.statement_warning_ratio` | `0.40` | Warning threshold |
| `timer.statement_critical_ratio` | `0.15` | Critical threshold |
| `timer.case_warning_ratio` | `0.25` | Case warning threshold |
| `timer.case_critical_ratio` | `0.10` | Case critical threshold |

## Telemetry Events

Emit these timer events for balancing:

- `timer.statement_started`
- `timer.statement_expired`
- `timer.case_expired`
- `timer.resolution_started`
- `timer.race_condition_resolved`

Required fields:

- `case_id`
- `turn_index`
- `tier`
- `remaining_ms_at_input`
- `urgency_tier`
- `outcome`

## Acceptance Criteria

- Timer behavior is deterministic at 30 FPS and 60 FPS.
- Timer expiry emits once per timer cycle.
- Pause/resume does not lose or gain time.
- Explicit input near timeout is resolved by timestamp rule.
- Statement timer never starts outside `STATEMENT_ACTIVE`.
- Case timeout can only fail the case after current turn resolves.
