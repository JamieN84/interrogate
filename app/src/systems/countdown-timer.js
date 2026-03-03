function normalizeMs(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  return Math.floor(numeric);
}

export const TimerState = Object.freeze({
  IDLE: "IDLE",
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  EXPIRED: "EXPIRED"
});

export class CountdownTimer {
  constructor({ onExpire } = {}) {
    this._onExpire = typeof onExpire === "function" ? onExpire : null;
    this._durationMs = 0;
    this._remainingMs = 0;
    this._expiredEmitted = false;
    this._state = TimerState.IDLE;
  }

  get state() {
    return this._state;
  }

  get durationMs() {
    return this._durationMs;
  }

  get remainingMs() {
    return this._remainingMs;
  }

  start(durationMs, { onExpire } = {}) {
    if (typeof onExpire === "function") {
      this._onExpire = onExpire;
    }

    this._durationMs = normalizeMs(durationMs);
    this._remainingMs = this._durationMs;
    this._expiredEmitted = false;

    if (this._remainingMs === 0) {
      this._expire();
      return this._remainingMs;
    }

    this._state = TimerState.RUNNING;
    return this._remainingMs;
  }

  stop() {
    this._state = TimerState.IDLE;
    return this._remainingMs;
  }

  pause() {
    if (this._state !== TimerState.RUNNING) {
      return false;
    }

    this._state = TimerState.PAUSED;
    return true;
  }

  resume() {
    if (this._state !== TimerState.PAUSED) {
      return false;
    }

    this._state = TimerState.RUNNING;
    return true;
  }

  reset(durationMs = this._durationMs) {
    this._durationMs = normalizeMs(durationMs);
    this._remainingMs = this._durationMs;
    this._expiredEmitted = false;
    this._state = TimerState.IDLE;
    return this._remainingMs;
  }

  tick(deltaMs) {
    if (this._state !== TimerState.RUNNING) {
      return this._remainingMs;
    }

    const delta = normalizeMs(deltaMs);
    this._remainingMs = Math.max(0, this._remainingMs - delta);

    if (this._remainingMs === 0) {
      this._expire();
    }

    return this._remainingMs;
  }

  _expire() {
    this._state = TimerState.EXPIRED;

    if (this._expiredEmitted) {
      return;
    }

    this._expiredEmitted = true;

    if (this._onExpire) {
      this._onExpire();
    }
  }
}
