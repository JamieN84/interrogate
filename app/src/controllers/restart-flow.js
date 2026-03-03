import { GameState } from "../core/game-state.js";

const DEFAULTS = Object.freeze({
  initialTrust: 100,
  evidenceRequired: 100,
  statementTimerStartMs: 0,
  resolutionTimerStartMs: 700,
  caseTimerEnabled: false,
  caseTimerStartMs: 0
});

function normalizeNonNegativeInt(value, fallback) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }

  return Math.floor(numeric);
}

function buildRuntimeSnapshot(config, restartCount) {
  const initialTrust = normalizeNonNegativeInt(config.initialTrust, DEFAULTS.initialTrust);
  const evidenceRequired = normalizeNonNegativeInt(
    config.evidenceRequired,
    DEFAULTS.evidenceRequired
  );
  const statementTimerStartMs = normalizeNonNegativeInt(
    config.statementTimerStartMs,
    DEFAULTS.statementTimerStartMs
  );
  const resolutionTimerStartMs = normalizeNonNegativeInt(
    config.resolutionTimerStartMs,
    DEFAULTS.resolutionTimerStartMs
  );
  const caseTimerEnabled = Boolean(config.caseTimerEnabled);
  const caseTimerStartMs = normalizeNonNegativeInt(
    config.caseTimerStartMs,
    DEFAULTS.caseTimerStartMs
  );

  return {
    state: GameState.CASE_BRIEF,
    trust: initialTrust,
    evidenceProgress: 0,
    evidenceRequired,
    turnIndex: 0,
    lastOutcome: null,
    failureReason: null,
    restartCount,
    timers: {
      statementStartMs: statementTimerStartMs,
      statementRemainingMs: 0,
      resolutionStartMs: resolutionTimerStartMs,
      resolutionRemainingMs: 0,
      caseTimerEnabled,
      caseStartMs: caseTimerEnabled ? caseTimerStartMs : 0,
      caseRemainingMs: caseTimerEnabled ? caseTimerStartMs : 0
    }
  };
}

export function createRuntimeSnapshot(config = {}) {
  return buildRuntimeSnapshot(
    {
      ...DEFAULTS,
      ...config
    },
    0
  );
}

export function restartRuntimeSnapshot(previousSnapshot, overrideConfig = {}) {
  if (!previousSnapshot || typeof previousSnapshot !== "object") {
    throw new TypeError("restartRuntimeSnapshot requires a previous snapshot object");
  }

  const previousTimers = previousSnapshot.timers ?? {};

  const mergedConfig = {
    initialTrust: overrideConfig.initialTrust ?? previousSnapshot.initialTrust ?? DEFAULTS.initialTrust,
    evidenceRequired:
      overrideConfig.evidenceRequired ??
      previousSnapshot.evidenceRequired ??
      DEFAULTS.evidenceRequired,
    statementTimerStartMs:
      overrideConfig.statementTimerStartMs ??
      previousTimers.statementStartMs ??
      DEFAULTS.statementTimerStartMs,
    resolutionTimerStartMs:
      overrideConfig.resolutionTimerStartMs ??
      previousTimers.resolutionStartMs ??
      DEFAULTS.resolutionTimerStartMs,
    caseTimerEnabled:
      overrideConfig.caseTimerEnabled ?? previousTimers.caseTimerEnabled ?? DEFAULTS.caseTimerEnabled,
    caseTimerStartMs:
      overrideConfig.caseTimerStartMs ?? previousTimers.caseStartMs ?? DEFAULTS.caseTimerStartMs
  };

  const restartCount = normalizeNonNegativeInt(previousSnapshot.restartCount, 0) + 1;

  return buildRuntimeSnapshot(mergedConfig, restartCount);
}

export function isRuntimeReadyForCaseStart(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    return false;
  }

  return (
    snapshot.state === GameState.CASE_BRIEF &&
    snapshot.turnIndex === 0 &&
    Number(snapshot.trust) > 0 &&
    Number(snapshot.evidenceProgress) === 0
  );
}
