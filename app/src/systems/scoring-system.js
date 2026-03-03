import { EvaluationOutcome } from "./evaluation-logic.js";

export const ScoringConfig = Object.freeze({
  correctAccusationPoints: 100,
  correctRestraintPoints: 40,
  falseAccusationPoints: -120,
  missedLiePoints: -80,
  timeBonusMax: 30,
  streak3Mult: 1.1,
  streak6Mult: 1.25,
  streak10Mult: 1.5,
  caseClearBonus: 500,
  trustBonusPerPoint: 5,
  failurePenalty: 250
});

const CORRECT_OUTCOMES = new Set([
  EvaluationOutcome.CORRECT_ACCUSATION,
  EvaluationOutcome.CORRECT_RESTRAINT
]);

const VALID_OUTCOMES = new Set(Object.values(EvaluationOutcome));

export const ScoreGrade = Object.freeze({
  S: "S",
  A: "A",
  B: "B",
  C: "C",
  D: "D"
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeMs(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  return Math.floor(numeric);
}

function roundHalfAwayFromZero(value) {
  if (value >= 0) {
    return Math.floor(value + 0.5);
  }

  return Math.ceil(value - 0.5);
}

export function getOutcomePoints(outcome, config = ScoringConfig) {
  switch (outcome) {
    case EvaluationOutcome.CORRECT_ACCUSATION:
      return config.correctAccusationPoints;
    case EvaluationOutcome.CORRECT_RESTRAINT:
      return config.correctRestraintPoints;
    case EvaluationOutcome.FALSE_ACCUSATION:
      return config.falseAccusationPoints;
    case EvaluationOutcome.MISSED_LIE:
      return config.missedLiePoints;
    default:
      throw new TypeError("Unknown evaluation outcome");
  }
}

export function getStreakMultiplier(streakCount, config = ScoringConfig) {
  if (streakCount >= 10) {
    return config.streak10Mult;
  }

  if (streakCount >= 6) {
    return config.streak6Mult;
  }

  if (streakCount >= 3) {
    return config.streak3Mult;
  }

  return 1;
}

export function calculateTimeBonus({
  isCorrect,
  remainingStatementMs,
  statementStartMs,
  config = ScoringConfig
}) {
  if (!isCorrect) {
    return 0;
  }

  const remaining = normalizeMs(remainingStatementMs);
  const start = normalizeMs(statementStartMs);

  if (start <= 0) {
    return 0;
  }

  const ratio = remaining / start;
  const rawBonus = Math.floor(ratio * config.timeBonusMax);
  return clamp(rawBonus, 0, config.timeBonusMax);
}

export function calculateAccuracyPct(correctOutcomes, totalResolvedStatements) {
  const total = Number(totalResolvedStatements);
  const correct = Number(correctOutcomes);

  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(correct) || correct <= 0) {
    return 0;
  }

  return (correct / total) * 100;
}

export function calculateGrade(accuracyPct, trustRemainingPct) {
  const accuracy = Number(accuracyPct) || 0;
  const trust = Number(trustRemainingPct) || 0;

  if (accuracy >= 90 && trust >= 40) {
    return ScoreGrade.S;
  }

  if (accuracy >= 80) {
    return ScoreGrade.A;
  }

  if (accuracy >= 70) {
    return ScoreGrade.B;
  }

  if (accuracy >= 60) {
    return ScoreGrade.C;
  }

  return ScoreGrade.D;
}

export class ScoringSystem {
  constructor(config = {}) {
    this._config = Object.freeze({
      ...ScoringConfig,
      ...config
    });

    this.reset();
  }

  get config() {
    return this._config;
  }

  get runningScore() {
    return this._runningScore;
  }

  get streakCount() {
    return this._streakCount;
  }

  get totalResolvedTurns() {
    return this._totalResolvedTurns;
  }

  get correctOutcomes() {
    return this._correctOutcomes;
  }

  get falseAccusations() {
    return this._falseAccusations;
  }

  reset() {
    this._runningScore = 0;
    this._streakCount = 0;
    this._totalResolvedTurns = 0;
    this._correctOutcomes = 0;
    this._falseAccusations = 0;
  }

  resolveTurn({
    outcome,
    remainingStatementMs = 0,
    statementStartMs = 0
  }) {
    if (!VALID_OUTCOMES.has(outcome)) {
      throw new TypeError("resolveTurn requires a valid evaluation outcome");
    }

    const isCorrect = CORRECT_OUTCOMES.has(outcome);

    this._totalResolvedTurns += 1;

    if (outcome === EvaluationOutcome.FALSE_ACCUSATION) {
      this._falseAccusations += 1;
    }

    if (isCorrect) {
      this._correctOutcomes += 1;
      this._streakCount += 1;
    } else {
      this._streakCount = 0;
    }

    const outcomePoints = getOutcomePoints(outcome, this._config);
    const timeBonus = calculateTimeBonus({
      isCorrect,
      remainingStatementMs,
      statementStartMs,
      config: this._config
    });
    const streakMultiplier = getStreakMultiplier(this._streakCount, this._config);
    const turnRaw = outcomePoints + timeBonus;
    const turnScore = roundHalfAwayFromZero(turnRaw * streakMultiplier);

    this._runningScore += turnScore;

    return Object.freeze({
      outcome,
      isCorrect,
      outcomePoints,
      timeBonus,
      streakCount: this._streakCount,
      streakMultiplier,
      turnRaw,
      turnScore,
      runningScore: this._runningScore
    });
  }

  finalizeCase({
    caseSuccess = false,
    trustRemaining = 0,
    hardFailure = false
  } = {}) {
    const trust = clamp(Number(trustRemaining) || 0, 0, 100);
    const caseClearBonus = caseSuccess ? this._config.caseClearBonus : 0;
    const trustBonus = caseSuccess ? trust * this._config.trustBonusPerPoint : 0;
    const failurePenalty = hardFailure ? this._config.failurePenalty : 0;

    const finalScore = Math.max(
      0,
      this._runningScore + caseClearBonus + trustBonus - failurePenalty
    );

    const accuracyPct = calculateAccuracyPct(this._correctOutcomes, this._totalResolvedTurns);
    const grade = calculateGrade(accuracyPct, trust);

    return Object.freeze({
      runningScore: this._runningScore,
      caseClearBonus,
      trustBonus,
      failurePenalty,
      finalScore,
      accuracyPct,
      grade,
      streakCount: this._streakCount,
      totalResolvedTurns: this._totalResolvedTurns,
      correctOutcomes: this._correctOutcomes,
      falseAccusations: this._falseAccusations
    });
  }
}
