export const EvaluatedAction = Object.freeze({
  ACCUSE: "ACCUSE",
  ACCEPT: "ACCEPT"
});

export const StatementTruth = Object.freeze({
  LIE: "LIE",
  TRUTH: "TRUTH"
});

export const EvaluationOutcome = Object.freeze({
  CORRECT_ACCUSATION: "CORRECT_ACCUSATION",
  FALSE_ACCUSATION: "FALSE_ACCUSATION",
  MISSED_LIE: "MISSED_LIE",
  CORRECT_RESTRAINT: "CORRECT_RESTRAINT"
});

function normalizePlayerAction(playerAction) {
  switch (playerAction) {
    case "ACCUSE":
    case "accuse":
      return EvaluatedAction.ACCUSE;
    case "NO_INPUT":
    case "ACCEPT":
    case "accept":
      return EvaluatedAction.ACCEPT;
    default:
      throw new TypeError("playerAction must be ACCUSE, NO_INPUT, or ACCEPT");
  }
}

function normalizeStatementTruth(statementTruth) {
  if (typeof statementTruth === "boolean") {
    return statementTruth ? StatementTruth.LIE : StatementTruth.TRUTH;
  }

  switch (statementTruth) {
    case "LIE":
    case "lie":
      return StatementTruth.LIE;
    case "TRUTH":
    case "truth":
      return StatementTruth.TRUTH;
    default:
      throw new TypeError("statementTruth must be a boolean, LIE, or TRUTH");
  }
}

export function evaluateTurn(playerAction, statementTruth) {
  const normalizedAction = normalizePlayerAction(playerAction);
  const normalizedTruth = normalizeStatementTruth(statementTruth);

  if (normalizedAction === EvaluatedAction.ACCUSE && normalizedTruth === StatementTruth.LIE) {
    return Object.freeze({
      playerAction: normalizedAction,
      statementTruth: normalizedTruth,
      outcome: EvaluationOutcome.CORRECT_ACCUSATION,
      isCorrect: true
    });
  }

  if (normalizedAction === EvaluatedAction.ACCUSE && normalizedTruth === StatementTruth.TRUTH) {
    return Object.freeze({
      playerAction: normalizedAction,
      statementTruth: normalizedTruth,
      outcome: EvaluationOutcome.FALSE_ACCUSATION,
      isCorrect: false
    });
  }

  if (normalizedAction === EvaluatedAction.ACCEPT && normalizedTruth === StatementTruth.LIE) {
    return Object.freeze({
      playerAction: normalizedAction,
      statementTruth: normalizedTruth,
      outcome: EvaluationOutcome.MISSED_LIE,
      isCorrect: false
    });
  }

  return Object.freeze({
    playerAction: normalizedAction,
    statementTruth: normalizedTruth,
    outcome: EvaluationOutcome.CORRECT_RESTRAINT,
    isCorrect: true
  });
}
