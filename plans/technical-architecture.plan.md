# Technical Architecture Plan

## Objective

Define the implementation architecture for the vertical slice as a plain JavaScript web app using regular HTML/CSS and no canvas.

## Target Platform

- Web

### Why?

- Zero install friction for quick testing and iteration.
- Fast feedback loop for "vibe coding" style development.
- Native support for DOM-based UI and accessible text-heavy interactions.
- Easy deploy path (static hosting is enough for the slice).

## Runtime Constraints

### Frame Loop Model

- Use `requestAnimationFrame` as the main runtime loop for timer and state progression.
- Keep simulation updates delta-time based in milliseconds.
- Clamp large deltas after tab inactivity to avoid giant timer jumps.

### Event-Driven vs Tick-Based

- Hybrid model: event-driven for user input/state transitions, tick-based (`requestAnimationFrame`) for timers, urgency updates, and animation timing.
- Core outcome resolution remains event-triggered at transition boundaries.

### Timing Precision Requirements

- Internal timing precision: integer milliseconds.
- Timer behavior must remain deterministic at common refresh rates (30/60+ FPS).
- Resolution lock window must respect configured duration (`600-800 ms`, default `700 ms`).
- Input-versus-timeout race handling must use timestamp comparison rules from timer spec.

## State Management Approach

### Finite State Machine?

- Yes. Use explicit finite states: `PRE_CASE`, `CASE_BRIEF`, `STATEMENT_ACTIVE`, `RESOLUTION`, `CASE_SUCCESS`, `CASE_FAILURE`, `PAUSED`.
- All transition rules must be centralized and validated against `core-loop.spec.md`.

### Central Game Controller?

- Yes. Implement a single `GameController` as the source of truth for current game state, active case data/turn index, subsystem orchestration, and render update dispatch.

### Event Bus?

- Yes, lightweight in-process event bus (pub/sub) for decoupling subsystems.
- Recommended events: input actions, timer expiry, turn resolved, state changed, score updated, UI feedback event.
- No networked or cross-tab event system required for vertical slice.

## Persistence Requirements (Even If Mocked)

### Is Save Required in Vertical Slice?

- No persistent save is required to call the vertical slice complete.
- Case/session can reset on page refresh without blocking milestone goals.

### Or Ephemeral Only?

- Yes. Use ephemeral in-memory state for vertical slice runtime.
- Optional localStorage mock is allowed for dev convenience, but not required by slice definition.

## Rendering Model

### DOM? Canvas? Engine-Based?

- DOM-based rendering only.
- Regular HTML/CSS for layout, typography, and feedback states.
- Plain JavaScript for state-driven DOM updates.
- Canvas and external game engines are explicitly out of scope.

### Single Screen Only?

- Yes. Single-screen gameplay-first layout for the slice.
- Optional overlays/modals are allowed for pause and end-case summaries.
- No multi-scene navigation architecture is required yet.

## Input Handling Model

### Debounce Rules

- Accept one actionable gameplay input per statement turn.
- Ignore repeated `ACCUSE` inputs after the first valid press in the same turn.
- Allow optional `100 ms` pre-start input buffer as defined in `core-loop.spec.md`.
- Ignore invalid inputs outside states where they are allowed.

### Input Lock During Transitions

- Lock gameplay input during `RESOLUTION`.
- Keep pause/resume controls active where state rules allow them.
- Unlock gameplay input only on entry to the next `STATEMENT_ACTIVE` turn.
- Preserve deterministic ordering when input and timeout occur in the same frame.

## Exit Criteria

- Architecture supports full vertical-slice loop without introducing unsupported platform dependencies.
- Core systems can be implemented without canvas, engine frameworks, or backend services.
- State, timing, rendering, and input behavior remain aligned with current spec documents.
