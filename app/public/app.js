import { GameState } from "../src/core/game-state.js";
import {
  createRuntimeSnapshot,
  restartRuntimeSnapshot
} from "../src/controllers/restart-flow.js";
import { EvaluationOutcome } from "../src/systems/evaluation-logic.js";
import { createBasicUiFeedback } from "../src/ui/basic-ui-feedback.js";

const DEMO_STATEMENTS = Object.freeze([
  "I never entered the records room last night.",
  "You can verify I was at the station from 20:00 onward.",
  "I did not speak to the witness before the report was filed.",
  "The ledger was already on the desk when I arrived."
]);

const DEMO_OUTCOME_SEQUENCE = Object.freeze([
  EvaluationOutcome.FALSE_ACCUSATION,
  EvaluationOutcome.MISSED_LIE,
  EvaluationOutcome.CORRECT_ACCUSATION,
  EvaluationOutcome.CORRECT_RESTRAINT
]);

const EVIDENCE_PER_CORRECT = 25;
const TRUST_LOSS_PER_MISTAKE = 25;
const EVIDENCE_REQUIRED = 100;
const RUNTIME_CONFIG = Object.freeze({
  initialTrust: 100,
  evidenceRequired: EVIDENCE_REQUIRED,
  statementTimerStartMs: 3200,
  resolutionTimerStartMs: 700,
  caseTimerEnabled: false,
  caseTimerStartMs: 0
});

export function buildReadyMessage() {
  return "Boilerplate loaded. Ready for local serve test.";
}

export function buildPingMessage(formattedTime) {
  return "UI event received at " + formattedTime;
}

export function buildRestartMessage() {
  return "Case restarted. Ready for another run.";
}

function getStatementForTurn(turnIndex) {
  return DEMO_STATEMENTS[turnIndex % DEMO_STATEMENTS.length];
}

function getOutcomeForTurn(turnIndex) {
  return DEMO_OUTCOME_SEQUENCE[turnIndex % DEMO_OUTCOME_SEQUENCE.length];
}

function getStatementTimerMs(turnIndex) {
  return Math.max(1000, 3200 - turnIndex * 150);
}

function isCorrectOutcome(outcome) {
  return (
    outcome === EvaluationOutcome.CORRECT_ACCUSATION ||
    outcome === EvaluationOutcome.CORRECT_RESTRAINT
  );
}

function isTerminalState(state) {
  return state === GameState.CASE_SUCCESS || state === GameState.CASE_FAILURE;
}

function renderSnapshot(feedback, runtime) {
  if (!feedback.isReady) {
    return;
  }

  feedback.renderSnapshot({
    statementText: getStatementForTurn(runtime.turnIndex),
    statementTimerMs: getStatementTimerMs(runtime.turnIndex),
    trust: runtime.trust,
    evidenceProgress: runtime.evidenceProgress,
    evidenceRequired: runtime.evidenceRequired
  });
}

function renderEndState(feedback, runtime) {
  if (!feedback.isReady) {
    return;
  }

  if (runtime.state === GameState.CASE_SUCCESS) {
    feedback.renderEndState({ state: GameState.CASE_SUCCESS });
    return;
  }

  if (runtime.state === GameState.CASE_FAILURE) {
    feedback.renderEndState({
      state: GameState.CASE_FAILURE,
      reason: runtime.failureReason ?? "Trust depleted."
    });
    return;
  }

  feedback.renderEndState();
}

function updateControlLocking(runtime, pingButton, restartButton) {
  const terminalState = isTerminalState(runtime.state);
  pingButton.disabled = terminalState;

  if (restartButton) {
    restartButton.disabled = !terminalState;
  }
}

function resolveTurn(runtime) {
  runtime.state = GameState.RESOLUTION;

  const outcome = getOutcomeForTurn(runtime.turnIndex);
  runtime.lastOutcome = outcome;

  if (isCorrectOutcome(outcome)) {
    runtime.evidenceProgress = Math.min(
      runtime.evidenceRequired,
      runtime.evidenceProgress + EVIDENCE_PER_CORRECT
    );
  } else {
    runtime.trust = Math.max(0, runtime.trust - TRUST_LOSS_PER_MISTAKE);
  }

  runtime.turnIndex += 1;

  if (runtime.trust <= 0) {
    runtime.state = GameState.CASE_FAILURE;
    runtime.failureReason = "Trust depleted.";
    return outcome;
  }

  if (runtime.evidenceProgress >= runtime.evidenceRequired) {
    runtime.state = GameState.CASE_SUCCESS;
    runtime.failureReason = null;
    return outcome;
  }

  runtime.state = GameState.STATEMENT_ACTIVE;
  runtime.failureReason = null;
  return outcome;
}

export function bootstrapApp(
  doc = document,
  nowProvider = () => new Date(),
  formatTime = (date) => date.toLocaleTimeString()
) {
  const statusEl = doc.getElementById("status");
  const pingButton = doc.getElementById("pingButton");
  const restartButton = doc.getElementById("restartButton");
  const feedback = createBasicUiFeedback(doc);

  if (!statusEl || !pingButton) {
    return false;
  }

  let runtime = createRuntimeSnapshot(RUNTIME_CONFIG);

  statusEl.textContent = buildReadyMessage();
  updateControlLocking(runtime, pingButton, restartButton);

  if (feedback.isReady) {
    renderSnapshot(feedback, runtime);
    feedback.clearOutcome();
    renderEndState(feedback, runtime);
  }

  pingButton.addEventListener("click", function onPing() {
    if (isTerminalState(runtime.state)) {
      return;
    }

    if (runtime.state === GameState.CASE_BRIEF) {
      runtime.state = GameState.STATEMENT_ACTIVE;
    }

    const outcome = resolveTurn(runtime);

    if (feedback.isReady) {
      feedback.renderOutcome(outcome);
      renderEndState(feedback, runtime);
      renderSnapshot(feedback, runtime);
    }

    updateControlLocking(runtime, pingButton, restartButton);
    statusEl.textContent = buildPingMessage(formatTime(nowProvider()));
  });

  if (restartButton) {
    restartButton.addEventListener("click", function onRestart() {
      if (!isTerminalState(runtime.state)) {
        return;
      }

      runtime = restartRuntimeSnapshot(runtime, RUNTIME_CONFIG);
      runtime.lastOutcome = null;

      if (feedback.isReady) {
        feedback.clearOutcome();
        renderEndState(feedback, runtime);
        renderSnapshot(feedback, runtime);
      }

      updateControlLocking(runtime, pingButton, restartButton);
      statusEl.textContent = buildRestartMessage();
    });
  }

  return true;
}
