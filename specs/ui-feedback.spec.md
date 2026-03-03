# UI Feedback Specification

## Purpose

Define how UI feedback communicates game state, player action outcomes, urgency, and failure/success conditions in INTERROGATE.

## Design Goals

- Keep feedback legible under time pressure.
- Make outcomes immediately understandable in under 1 second.
- Avoid decorative noise that competes with decision-making.
- Ensure accessibility parity for reduced motion and color-vision differences.

## Feedback Channels

| Channel | Primary Use | Must Be Enabled |
| --- | --- | --- |
| Visual text | Statement content, status labels, result messages | Yes |
| Visual color | Urgency and outcome emphasis | Yes |
| Motion | Temporal emphasis and outcome impact | Yes (reduced in accessibility mode) |
| Audio cue | Reinforce urgency and result state | Optional by user settings |
| Haptic cue | Platform-specific reinforcement | Optional, device dependent |

## UI Surface Inventory

| Surface | Location | Role |
| --- | --- | --- |
| Statement panel | Center | Current suspect statement and decision focus |
| Accuse button | Bottom center | Primary action affordance |
| Statement timer bar | Under statement | Remaining turn time |
| Case timer | Top strip (timed modes) | Remaining case time budget |
| Trust meter | Side rail | Risk state and failure proximity |
| Evidence/progress meter | Side rail | Success progression |
| Feedback banner | Center overlay | Short resolution outcome messages |
| End-case panel | Full overlay | Grade, score, fail reason, next actions |

## Feedback Severity Levels

| Level | Meaning | Visual Rule |
| --- | --- | --- |
| `INFO` | Neutral status update | Base text and base contrast |
| `WARN` | Elevated risk but recoverable | Warning accent and subtle pulse |
| `CRITICAL` | Immediate failure risk | Critical accent, stronger pulse, optional shake |
| `RESULT_POSITIVE` | Correct action or success | Positive accent flash, confirmation text |
| `RESULT_NEGATIVE` | Incorrect action or failure | Negative accent flash, error text |

## State-Based Feedback Rules

| Game State | Required Feedback |
| --- | --- |
| `CASE_BRIEF` | Show case facts, controls reminder, and start prompt |
| `STATEMENT_ACTIVE` | Show statement text, active timer, and accuse affordance |
| `RESOLUTION` | Lock input and show one outcome banner for 600-800 ms |
| `PAUSED` | Dim gameplay layer and show paused modal with resume/quit |
| `CASE_SUCCESS` | Show success panel with grade, score breakdown, and continue |
| `CASE_FAILURE` | Show fail panel with primary reason and restart |

## Event-to-Feedback Mapping

| Event | Severity | Visual Response | Duration |
| --- | --- | --- | --- |
| Statement appears | `INFO` | Fade/type-in statement text | 120-220 ms |
| Timer enters warning | `WARN` | Timer bar warning color + mild pulse | Until tier changes |
| Timer enters critical | `CRITICAL` | Timer bar critical color + stronger pulse | Until resolve/expiry |
| Player presses accuse | `INFO` | Button press state + immediate lock | Frame-immediate |
| Correct accusation | `RESULT_POSITIVE` | Positive flash + "Contradiction found" banner | 600-800 ms |
| Correct restraint | `RESULT_POSITIVE` | Subtle positive pulse + "Statement holds" banner | 600-800 ms |
| False accusation | `RESULT_NEGATIVE` | Negative flash + short shake + trust drop animation | 600-800 ms |
| Missed lie | `RESULT_NEGATIVE` | Negative pulse + "Lie missed" banner | 600-800 ms |
| Trust enters critical | `CRITICAL` | Trust meter critical color and periodic pulse | While critical |
| Case solved | `RESULT_POSITIVE` | Transition to success panel | Until dismissed |
| Case failed | `RESULT_NEGATIVE` | Transition to failure panel | Until dismissed |

## Timer Feedback Rules

### Statement Timer

- `NORMAL`: base color, no pulse.
- `WARNING` (`<= 40%` remaining): warning color, pulse every 700 ms.
- `CRITICAL` (`<= 15%` remaining): critical color, pulse every 350 ms.

### Case Timer (timed modes)

- `NORMAL`: base case timer style.
- `WARNING` (`<= 25%` remaining): warning accent on timer label.
- `CRITICAL` (`<= 10%` remaining): critical accent and stronger timer pulse.

## Outcome Feedback Rules

### Resolution Banner Rules

- Exactly one banner is displayed per resolved turn.
- Banner text max length: 32 characters.
- Banner stays visible for `resolution_timer` duration from `timer.spec.md`.
- Banner is non-interactive and does not block end-case panel transitions.

### Approved MVP Banner Copy

| Outcome | Banner Text |
| --- | --- |
| Correct accusation | `Contradiction found.` |
| Correct restraint | `Statement holds.` |
| False accusation | `That was truthful.` |
| Missed lie | `Lie missed.` |
| Trust critical | `Trust is weakening.` |
| Timeout fail | `Case window expired.` |

## Meter Feedback Rules

### Trust Meter

- Animate decreases over 180-260 ms with easing-out.
- On any trust loss, show a one-step flash at meter edge.
- On critical threshold crossing, emit critical state only once per crossing.

### Evidence/Progress Meter

- Animate increases over 180-260 ms with easing-out.
- Never animate backwards unless a ruleset explicitly supports regressions.
- On completion, snap to full and trigger success transition check.

## Input Feedback Rules

| Input Condition | UI Response |
| --- | --- |
| Valid `ACCUSE` in `STATEMENT_ACTIVE` | Show pressed state and lock further turn input |
| Input during `RESOLUTION` | Ignore action, no warning |
| Input during `PAUSED` outside modal controls | Ignore action |
| Input on expired statement frame | Resolve by timestamp race rule from `timer.spec.md` |

## Accessibility Requirements

- Minimum text contrast ratio: 4.5:1 for standard text.
- Do not rely on color alone for urgency; pair with shape/pulse/state labels.
- Provide reduced-motion mode that disables shake effects.
- In reduced-motion mode, replace pulses with static emphasis styles.
- In reduced-motion mode, preserve equivalent information timing and readability.
- Provide subtitle/text equivalents for critical audio cues.

## Performance and Stability Constraints

- Feedback animations must not alter gameplay timing values.
- UI animation frame drops must not change timer logic outcomes.
- Maximum simultaneous non-essential animations during turn: 2.
- All feedback transitions must complete without blocking input processing in valid states.

## Telemetry Events

- `ui_feedback.event_fired`
- `ui_feedback.urgency_changed`
- `ui_feedback.banner_shown`
- `ui_feedback.accessibility_mode_changed`

Required fields:

- `case_id`
- `turn_index`
- `event_name`
- `severity`
- `ui_state`
- `timer_tier`
- `accessibility_mode`

## Acceptance Criteria

- Every gameplay outcome maps to exactly one resolution banner.
- Urgency tier transitions are visually distinct at configured thresholds.
- Reduced-motion mode removes motion-heavy effects without information loss.
- Invalid inputs never generate misleading feedback.
- Success and failure panels always show within one frame of terminal state entry.
