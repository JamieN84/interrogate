import { describe, expect, it } from "vitest";
import { EvaluationOutcome } from "../../src/systems/evaluation-logic.js";
import {
  calculateGrade,
  calculateTimeBonus,
  getOutcomePoints,
  getStreakMultiplier,
  ScoreGrade,
  ScoringSystem
} from "../../src/systems/scoring-system.js";

describe("scoring-system helpers", () => {
  it("maps outcomes to configured points", () => {
    expect(getOutcomePoints(EvaluationOutcome.CORRECT_ACCUSATION)).toBe(100);
    expect(getOutcomePoints(EvaluationOutcome.CORRECT_RESTRAINT)).toBe(40);
    expect(getOutcomePoints(EvaluationOutcome.FALSE_ACCUSATION)).toBe(-120);
    expect(getOutcomePoints(EvaluationOutcome.MISSED_LIE)).toBe(-80);
  });

  it("calculates time bonus with clamp and correctness rule", () => {
    expect(
      calculateTimeBonus({
        isCorrect: true,
        remainingStatementMs: 500,
        statementStartMs: 1000
      })
    ).toBe(15);

    expect(
      calculateTimeBonus({
        isCorrect: true,
        remainingStatementMs: 2000,
        statementStartMs: 1000
      })
    ).toBe(30);

    expect(
      calculateTimeBonus({
        isCorrect: false,
        remainingStatementMs: 500,
        statementStartMs: 1000
      })
    ).toBe(0);
  });

  it("applies streak multipliers at exact thresholds", () => {
    expect(getStreakMultiplier(2)).toBe(1);
    expect(getStreakMultiplier(3)).toBe(1.1);
    expect(getStreakMultiplier(6)).toBe(1.25);
    expect(getStreakMultiplier(10)).toBe(1.5);
  });

  it("calculates grade boundaries including S trust requirement", () => {
    expect(calculateGrade(95, 50)).toBe(ScoreGrade.S);
    expect(calculateGrade(95, 30)).toBe(ScoreGrade.A);
    expect(calculateGrade(80, 10)).toBe(ScoreGrade.A);
    expect(calculateGrade(70, 10)).toBe(ScoreGrade.B);
    expect(calculateGrade(60, 10)).toBe(ScoreGrade.C);
    expect(calculateGrade(59.9, 10)).toBe(ScoreGrade.D);
  });
});

describe("ScoringSystem", () => {
  it("updates running total and streak based on resolved outcomes", () => {
    const scoring = new ScoringSystem();

    const first = scoring.resolveTurn({
      outcome: EvaluationOutcome.CORRECT_ACCUSATION,
      remainingStatementMs: 500,
      statementStartMs: 1000
    });
    expect(first.turnScore).toBe(115);
    expect(first.streakCount).toBe(1);
    expect(first.streakMultiplier).toBe(1);

    scoring.resolveTurn({
      outcome: EvaluationOutcome.CORRECT_ACCUSATION,
      remainingStatementMs: 500,
      statementStartMs: 1000
    });

    const third = scoring.resolveTurn({
      outcome: EvaluationOutcome.CORRECT_ACCUSATION,
      remainingStatementMs: 500,
      statementStartMs: 1000
    });

    expect(third.streakCount).toBe(3);
    expect(third.streakMultiplier).toBe(1.1);
    expect(third.turnScore).toBe(127);

    const incorrect = scoring.resolveTurn({
      outcome: EvaluationOutcome.FALSE_ACCUSATION,
      remainingStatementMs: 1000,
      statementStartMs: 1000
    });

    expect(incorrect.timeBonus).toBe(0);
    expect(incorrect.streakCount).toBe(0);
    expect(scoring.falseAccusations).toBe(1);
  });

  it("clamps final score at zero and applies bonuses/penalties", () => {
    const scoring = new ScoringSystem();

    scoring.resolveTurn({
      outcome: EvaluationOutcome.FALSE_ACCUSATION
    });

    const failed = scoring.finalizeCase({
      caseSuccess: false,
      trustRemaining: 0,
      hardFailure: true
    });

    expect(failed.finalScore).toBe(0);
    expect(failed.failurePenalty).toBe(250);

    const successful = new ScoringSystem();
    successful.resolveTurn({
      outcome: EvaluationOutcome.CORRECT_RESTRAINT,
      remainingStatementMs: 500,
      statementStartMs: 1000
    });

    const result = successful.finalizeCase({
      caseSuccess: true,
      trustRemaining: 42,
      hardFailure: false
    });

    expect(result.caseClearBonus).toBe(500);
    expect(result.trustBonus).toBe(210);
    expect(result.finalScore).toBeGreaterThan(0);
  });
});
