import { describe, expect, it } from "vitest";
import { GameState } from "../../src/core/game-state.js";
import {
  isRuntimeReadyForCaseStart,
  restartRuntimeSnapshot
} from "../../src/controllers/restart-flow.js";

describe("restart flow integration", () => {
  it("restarts a failed run into a fresh case-brief runtime snapshot", () => {
    const failedSnapshot = {
      state: GameState.CASE_FAILURE,
      trust: 0,
      evidenceProgress: 72,
      evidenceRequired: 100,
      turnIndex: 8,
      lastOutcome: "FALSE_ACCUSATION",
      failureReason: "TRUST_DEPLETED",
      restartCount: 2,
      timers: {
        statementStartMs: 2200,
        statementRemainingMs: 0,
        resolutionStartMs: 700,
        resolutionRemainingMs: 0,
        caseTimerEnabled: true,
        caseStartMs: 45000,
        caseRemainingMs: 0
      }
    };

    const restarted = restartRuntimeSnapshot(failedSnapshot, {
      initialTrust: 100
    });

    expect(restarted).toEqual({
      state: GameState.CASE_BRIEF,
      trust: 100,
      evidenceProgress: 0,
      evidenceRequired: 100,
      turnIndex: 0,
      lastOutcome: null,
      failureReason: null,
      restartCount: 3,
      timers: {
        statementStartMs: 2200,
        statementRemainingMs: 0,
        resolutionStartMs: 700,
        resolutionRemainingMs: 0,
        caseTimerEnabled: true,
        caseStartMs: 45000,
        caseRemainingMs: 45000
      }
    });

    expect(isRuntimeReadyForCaseStart(restarted)).toBe(true);
  });

  it("rejects invalid restart input", () => {
    expect(() => restartRuntimeSnapshot(null)).toThrow(TypeError);
  });
});
