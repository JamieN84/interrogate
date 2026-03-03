export const FailureReason = Object.freeze({
  TRUST_DEPLETED: "TRUST_DEPLETED",
  CASE_TIMEOUT: "CASE_TIMEOUT"
});

function toNumberOrDefault(value, defaultValue) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : defaultValue;
}

export function evaluateFailureState(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    throw new TypeError("evaluateFailureState requires a snapshot object");
  }

  const trust = toNumberOrDefault(snapshot.trust, 0);
  const caseTimerEnabled = Boolean(snapshot.caseTimerEnabled);
  const caseTimerMs = toNumberOrDefault(snapshot.caseTimerMs, Number.POSITIVE_INFINITY);
  const evidenceProgress = toNumberOrDefault(snapshot.evidenceProgress, 0);
  const evidenceRequired = toNumberOrDefault(snapshot.evidenceRequired, 0);

  if (trust <= 0) {
    return Object.freeze({
      hasFailed: true,
      reason: FailureReason.TRUST_DEPLETED
    });
  }

  if (caseTimerEnabled && caseTimerMs <= 0 && evidenceProgress < evidenceRequired) {
    return Object.freeze({
      hasFailed: true,
      reason: FailureReason.CASE_TIMEOUT
    });
  }

  return Object.freeze({
    hasFailed: false,
    reason: null
  });
}
