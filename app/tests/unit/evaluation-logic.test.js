import { describe, expect, it } from "vitest";
import {
  evaluateTurn,
  EvaluatedAction,
  EvaluationOutcome,
  StatementTruth
} from "../../src/systems/evaluation-logic.js";

describe("evaluateTurn", () => {
  const matrix = [
    {
      name: "accuse + lie => correct accusation",
      playerAction: "ACCUSE",
      statementTruth: true,
      expectedOutcome: EvaluationOutcome.CORRECT_ACCUSATION,
      expectedCorrect: true,
      expectedAction: EvaluatedAction.ACCUSE,
      expectedTruth: StatementTruth.LIE
    },
    {
      name: "accuse + truth => false accusation",
      playerAction: "ACCUSE",
      statementTruth: false,
      expectedOutcome: EvaluationOutcome.FALSE_ACCUSATION,
      expectedCorrect: false,
      expectedAction: EvaluatedAction.ACCUSE,
      expectedTruth: StatementTruth.TRUTH
    },
    {
      name: "accept/no_input + lie => missed lie",
      playerAction: "NO_INPUT",
      statementTruth: true,
      expectedOutcome: EvaluationOutcome.MISSED_LIE,
      expectedCorrect: false,
      expectedAction: EvaluatedAction.ACCEPT,
      expectedTruth: StatementTruth.LIE
    },
    {
      name: "accept/no_input + truth => correct restraint",
      playerAction: "NO_INPUT",
      statementTruth: false,
      expectedOutcome: EvaluationOutcome.CORRECT_RESTRAINT,
      expectedCorrect: true,
      expectedAction: EvaluatedAction.ACCEPT,
      expectedTruth: StatementTruth.TRUTH
    }
  ];

  for (const scenario of matrix) {
    it(scenario.name, () => {
      const result = evaluateTurn(scenario.playerAction, scenario.statementTruth);
      expect(result).toEqual({
        playerAction: scenario.expectedAction,
        statementTruth: scenario.expectedTruth,
        outcome: scenario.expectedOutcome,
        isCorrect: scenario.expectedCorrect
      });
      expect(Object.isFrozen(result)).toBe(true);
    });
  }

  it("accepts string truth labels and player action aliases", () => {
    expect(evaluateTurn("accept", "truth")).toEqual({
      playerAction: EvaluatedAction.ACCEPT,
      statementTruth: StatementTruth.TRUTH,
      outcome: EvaluationOutcome.CORRECT_RESTRAINT,
      isCorrect: true
    });
    expect(evaluateTurn("accuse", "lie")).toEqual({
      playerAction: EvaluatedAction.ACCUSE,
      statementTruth: StatementTruth.LIE,
      outcome: EvaluationOutcome.CORRECT_ACCUSATION,
      isCorrect: true
    });
  });

  it("throws on invalid action or truth values", () => {
    expect(() => evaluateTurn("INVALID_ACTION", true)).toThrow(TypeError);
    expect(() => evaluateTurn("ACCUSE", "MAYBE")).toThrow(TypeError);
  });
});
