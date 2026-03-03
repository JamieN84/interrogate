import { describe, expect, it } from "vitest";
import { evaluateFailureState, FailureReason } from "../../src/systems/failure-rules.js";

describe("evaluateFailureState", () => {
  it("fails when trust is zero or below", () => {
    const result = evaluateFailureState({
      trust: 0,
      caseTimerEnabled: true,
      caseTimerMs: 9999,
      evidenceProgress: 0,
      evidenceRequired: 10
    });

    expect(result).toEqual({
      hasFailed: true,
      reason: FailureReason.TRUST_DEPLETED
    });
  });

  it("fails on case timeout when evidence is insufficient", () => {
    const result = evaluateFailureState({
      trust: 10,
      caseTimerEnabled: true,
      caseTimerMs: 0,
      evidenceProgress: 7,
      evidenceRequired: 10
    });

    expect(result).toEqual({
      hasFailed: true,
      reason: FailureReason.CASE_TIMEOUT
    });
  });

  it("does not fail on timeout when evidence requirement is met", () => {
    const result = evaluateFailureState({
      trust: 10,
      caseTimerEnabled: true,
      caseTimerMs: 0,
      evidenceProgress: 10,
      evidenceRequired: 10
    });

    expect(result).toEqual({
      hasFailed: false,
      reason: null
    });
  });

  it("does not evaluate case timeout when case timer is disabled", () => {
    const result = evaluateFailureState({
      trust: 10,
      caseTimerEnabled: false,
      caseTimerMs: 0,
      evidenceProgress: 1,
      evidenceRequired: 10
    });

    expect(result).toEqual({
      hasFailed: false,
      reason: null
    });
  });

  it("throws when called without a snapshot object", () => {
    expect(() => evaluateFailureState(null)).toThrow(TypeError);
    expect(() => evaluateFailureState(undefined)).toThrow(TypeError);
  });
});
