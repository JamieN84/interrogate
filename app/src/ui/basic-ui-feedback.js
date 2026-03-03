import { GameState } from "../core/game-state.js";
import { EvaluationOutcome } from "../systems/evaluation-logic.js";

const OUTCOME_MESSAGE = Object.freeze({
  [EvaluationOutcome.CORRECT_ACCUSATION]: "Contradiction found.",
  [EvaluationOutcome.CORRECT_RESTRAINT]: "Statement holds.",
  [EvaluationOutcome.FALSE_ACCUSATION]: "That was truthful.",
  [EvaluationOutcome.MISSED_LIE]: "Lie missed."
});

const END_STATE_MESSAGE = Object.freeze({
  [GameState.CASE_SUCCESS]: "Case solved.",
  [GameState.CASE_FAILURE]: "Case failed."
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function formatTimerMs(ms) {
  const normalized = Math.max(0, normalizeNumber(ms, 0));
  return (normalized / 1000).toFixed(1) + "s";
}

export function buildOutcomeMessage(outcome) {
  return OUTCOME_MESSAGE[outcome] ?? null;
}

export function buildEndStateMessage({ state, reason = null } = {}) {
  if (state === GameState.CASE_FAILURE && reason) {
    return END_STATE_MESSAGE[state] + " " + reason;
  }

  return END_STATE_MESSAGE[state] ?? "";
}

export function createBasicUiFeedback(doc = document) {
  const statementTextEl = doc.getElementById("statementText");
  const statementTimerEl = doc.getElementById("statementTimer");
  const trustValueEl = doc.getElementById("trustValue");
  const progressValueEl = doc.getElementById("progressValue");
  const outcomeBannerEl = doc.getElementById("outcomeBanner");
  const endStateMessageEl = doc.getElementById("endStateMessage");

  const hasRequiredElements =
    Boolean(statementTextEl) &&
    Boolean(statementTimerEl) &&
    Boolean(trustValueEl) &&
    Boolean(progressValueEl) &&
    Boolean(outcomeBannerEl) &&
    Boolean(endStateMessageEl);

  function renderSnapshot({
    statementText = "",
    statementTimerMs = 0,
    trust = 0,
    evidenceProgress = 0,
    evidenceRequired = 0
  } = {}) {
    if (!hasRequiredElements) {
      return false;
    }

    const normalizedTrust = clamp(normalizeNumber(trust), 0, 100);
    const normalizedEvidence = Math.max(0, normalizeNumber(evidenceProgress));
    const normalizedEvidenceRequired = Math.max(0, normalizeNumber(evidenceRequired));

    statementTextEl.textContent = statementText || "Awaiting statement...";
    statementTimerEl.textContent = "Timer: " + formatTimerMs(statementTimerMs);
    trustValueEl.textContent = "Trust: " + normalizedTrust + "%";
    progressValueEl.textContent =
      "Evidence: " + normalizedEvidence + " / " + normalizedEvidenceRequired;

    return true;
  }

  function renderOutcome(outcome) {
    if (!hasRequiredElements) {
      return false;
    }

    const message = buildOutcomeMessage(outcome);

    if (!message) {
      return false;
    }

    outcomeBannerEl.textContent = message;
    return true;
  }

  function clearOutcome() {
    if (!hasRequiredElements) {
      return false;
    }

    outcomeBannerEl.textContent = "";
    return true;
  }

  function renderEndState({ state, reason = null } = {}) {
    if (!hasRequiredElements) {
      return false;
    }

    endStateMessageEl.textContent = buildEndStateMessage({ state, reason });
    return true;
  }

  return {
    isReady: hasRequiredElements,
    renderSnapshot,
    renderOutcome,
    clearOutcome,
    renderEndState
  };
}
