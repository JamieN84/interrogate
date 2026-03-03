# INTERROGATE (Working Title)

## Game Overview

INTERROGATE is a minimalist, single-screen psychological crime game where the player acts as a detective in timed interrogations. The core interaction is intentionally simple: read each statement, decide if it is a lie, and press one accusation button before time runs out.

The game is built around cognitive pressure, not mechanical complexity. Players are tested on memory, contradiction tracking, and risk management while audiovisual feedback steadily increases tension.

### Product Intent

- Deliver short, high-intensity sessions that feel mentally demanding.
- Create mastery through information parsing and pattern recognition.
- Keep controls and UI simple enough that failure feels like a judgment error, not an input error.

### MVP Scope

- Single-player case mode.
- Structured case templates with escalating difficulty.
- End-of-case scoring based on accuracy, speed, and trust remaining.
- Clean, high-contrast interface with strong audio-driven tension.

## Core Gameplay Loop

Each session is one case and follows this repeatable loop.

### 1. Case Briefing

- Show 1-3 key facts and known timeline anchors.
- Introduce suspects and initial trust/progress values.
- Prime the player with limited but essential context.

### 2. Statement Turn

- Present one suspect statement in a fixed center position.
- Start a per-statement timer immediately.
- Allow only two actions: accuse (button press) or accept (no input).

### 3. Resolution

- Evaluate player choice against statement truth state.
- Apply system effects:
- Correct accusation increases case progress.
- Incorrect accusation sharply lowers trust.
- Missed lie reduces momentum or adds noise to later turns.
- Show short, readable feedback in under one second.

### 4. Escalation

- Advance case complexity by tightening timers and increasing contradiction density.
- Introduce multi-suspect cross references in later stages.
- Mix direct lies with omissions and partial truths.

### 5. Case End

- End in success when required evidence threshold is reached.
- End in failure when trust or time conditions break.
- Show post-case grade with key performance stats and replay prompt.

## Player Goal

### Primary Goal

Solve each case by correctly identifying enough deceptive statements before losing control of the interrogation.

### Secondary Goals

- Maintain trust to avoid timer compression and preserve information quality.
- Minimize false accusations to protect score multipliers.
- Build streaks of correct decisions for higher final grades.
- Learn lie patterns across cases to improve long-term mastery.

### Long-Term Motivation

- Climb rank tiers based on consistent accuracy.
- Unlock harder cases and variant lie patterns.
- Improve personal best metrics in daily and challenge modes.

## Failure Conditions

### Hard Failure States

- Trust meter reaches zero.
- Global case timer expires before evidence threshold is met.
- Scripted critical mistake in special challenge modes (optional rule set).

### Soft Failure States

- Case technically solved but with low grade due to poor accuracy.
- High false-positive rate that reduces progression rewards and can block leaderboard eligibility.
- Reduced end-of-case progression from inefficient play.

### Failure Design Principles

- Failures should be clearly attributable to player decisions.
- Feedback should indicate why the player failed without revealing full solutions.
- Retry flow should be immediate to encourage quick iteration.

## Visual Style Direction

### Style Keywords

- Minimal
- Noir
- Clinical
- Tense
- Legible

### Visual Identity

- Background: near-black and charcoal tones.
- Text: off-white with strict contrast targets.
- Accent: one warning color family (deep red or muted amber).
- Decorative elements: minimal and functional.

### Layout System

- Top: case label, suspect indicator, concise context strip.
- Center: large statement text with strong typographic hierarchy.
- Under statement: timer bar and response cue.
- Bottom center: single accusation button.
- Side rail: trust and progress meters.

### Motion Language

- Statement entrance: short fade or type-in, never flashy.
- Timer: smooth depletion with end-window urgency pulse.
- Incorrect accusation: brief shake and desaturation dip.
- Correct accusation: restrained accent flash and confirmation pulse.
- Low trust: subtle vignette tightening and ambient darkening.

### Readability and Accessibility

- Prioritize high contrast and clear hierarchy over style effects.
- Avoid long animated transitions that obscure decision windows.
- Support color-blind-safe alternatives for trust/progress signals.
- Include reduced-motion mode without gameplay disadvantage.

## Audio Direction

### Audio Pillars

- Tension through restraint.
- Information clarity over cinematic noise.
- Reactive mix that tracks risk state.

### Core Sound Layers

- Persistent room tone with low-frequency interrogation hum.
- Timer-linked pulse or tick that intensifies near timeout.
- UI interaction layer for accusation and state changes.
- Sparse tonal stingers for success and failure reinforcement.

### Event Sound Map

- Correct accusation: brief clean confirmation tone.
- Incorrect accusation: dissonant hit with short tail.
- Missed lie: soft warning cue, less aggressive than error.
- Trust critical: filtered heartbeat or pressure swell.
- Case solved: controlled release cue, not triumphant fanfare.
- Case failed: dry cutoff plus low-impact resolve tone.

### Mixing Rules

- Keep dynamic range moderate for headphones and laptop speakers.
- Sidechain ambient layer under critical feedback events.
- Prevent overlapping cues from masking decision-relevant sounds.
- Provide separate sliders for master, ambience, SFX, and UI cues.

## Target Audience

### Primary Audience

- Players aged 16-35 who enjoy deduction, logic, and pressure-based decision games.
- Fans of short-session games with high replay value.
- Players who prefer mental challenge over high-APM mechanics.

### Secondary Audience

- Narrative mystery players seeking lighter, systems-first detective play.
- Streamers and challenge-oriented communities that value score optimization.

### Audience Expectations

- Fast onboarding and immediate stakes.
- Fair but punishing rules.
- Strong mood without graphic content.
- Replay modes that reward learning and consistency.

### Content Boundaries

- No explicit violence or gore.
- Psychological pressure is the core tone, not horror shock.
- Dialogue and themes should remain mature but broadly accessible.

## Design Pillars

1. One Input, Many Consequences
   Every press carries strategic cost, so interaction remains simple while decisions stay deep.

2. Evidence Over Guessing
   Lies must be rooted in readable logic, not random trickery.

3. Pressure Creates Meaning
   Timers and trust systems exist to force commitment, not to create noise.

4. Clarity Under Stress
   UI, text, and audio must remain readable even at peak intensity.

5. Short Sessions, Long Mastery
   A single case is quick to play, but mastery comes from pattern learning over time.

## Future Expansion Ideas

### Content Expansion

- Themed case packs with distinct evidence vocabularies.
- Multi-part investigations with recurring suspects and callbacks.
- Regional and localization variants with culturally adapted cases.

### System Expansion

- Behavioral tell layer (hesitation, wording drift, evasive framing).
- Branching interrogation paths based on trust and prior decisions.
- Advanced modifiers like unreliable evidence or false corroboration.

### Mode Expansion

- Endless mode with procedural contradiction chains.
- Daily seeded challenge with global leaderboard.
- Weekly mutators that change core constraints (timer, trust decay, visibility).

### Narrative Expansion

- Light campaign arc connecting standalone cases.
- Detective reputation system affecting future suspect behavior.
- Key story decisions that unlock alternate case variants.

### Technical and Platform Expansion

- Controller and keyboard parity with accessibility presets.
- Cloud-save profile and cross-device stat tracking.
- Post-launch telemetry tuning for difficulty and pacing balance.

## Summary

INTERROGATE is a focused psychological deduction game where one button drives high-stakes choices. The core value is tension through logic: players win by reading contradictions under pressure, not by mastering complex controls. This document defines the production direction for gameplay, presentation, audience targeting, and near-term expansion planning.
