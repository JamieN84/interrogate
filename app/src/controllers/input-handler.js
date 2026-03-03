import { GameState } from "../core/game-state.js";

export const InputAction = Object.freeze({
  ACCUSE: "ACCUSE",
  NO_INPUT: "NO_INPUT",
  PAUSE: "PAUSE",
  RESUME: "RESUME"
});

const TURN_DECISION_ACTIONS = new Set([InputAction.ACCUSE, InputAction.NO_INPUT]);

function isNonTerminalState(state) {
  return ![GameState.CASE_SUCCESS, GameState.CASE_FAILURE].includes(state);
}

function isActionAllowedInState(action, state) {
  switch (action) {
    case InputAction.ACCUSE:
    case InputAction.NO_INPUT:
      return state === GameState.STATEMENT_ACTIVE;
    case InputAction.PAUSE:
      return state !== GameState.PAUSED && isNonTerminalState(state);
    case InputAction.RESUME:
      return state === GameState.PAUSED;
    default:
      return false;
  }
}

export class InputHandler {
  constructor({
    getGameState,
    onAction,
    nowProvider = () => Date.now(),
    inputBufferMs = 100
  }) {
    if (typeof getGameState !== "function") {
      throw new TypeError("getGameState must be a function");
    }

    if (typeof onAction !== "function") {
      throw new TypeError("onAction must be a function");
    }

    this._getGameState = getGameState;
    this._onAction = onAction;
    this._nowProvider = nowProvider;
    this._inputBufferMs = Math.max(0, Number(inputBufferMs) || 0);

    this._turnDecisionLocked = true;
    this._turnOpenAtMs = Number.POSITIVE_INFINITY;

    this._boundTarget = null;
    this._boundAccuseButton = null;
    this._boundPauseButton = null;
    this._boundResumeButton = null;
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onAccuseClick = () => this.handleAccuse("button");
    this._onPauseClick = () => this.handlePause("button");
    this._onResumeClick = () => this.handleResume("button");
  }

  beginTurn({ inputBufferMs = this._inputBufferMs } = {}) {
    const buffer = Math.max(0, Number(inputBufferMs) || 0);
    this._turnDecisionLocked = false;
    this._turnOpenAtMs = this._nowProvider() - buffer;
  }

  endTurn() {
    this._turnDecisionLocked = true;
    this._turnOpenAtMs = Number.POSITIVE_INFINITY;
  }

  handleAccuse(source = "manual") {
    return this._dispatch(InputAction.ACCUSE, source);
  }

  handleTimeout(source = "timeout") {
    return this._dispatch(InputAction.NO_INPUT, source);
  }

  handlePause(source = "manual") {
    return this._dispatch(InputAction.PAUSE, source);
  }

  handleResume(source = "manual") {
    return this._dispatch(InputAction.RESUME, source);
  }

  bind({
    target = document,
    accuseButton = null,
    pauseButton = null,
    resumeButton = null
  } = {}) {
    this.unbind();

    if (target && typeof target.addEventListener === "function") {
      target.addEventListener("keydown", this._onKeyDown);
      this._boundTarget = target;
    }

    if (accuseButton && typeof accuseButton.addEventListener === "function") {
      accuseButton.addEventListener("click", this._onAccuseClick);
      this._boundAccuseButton = accuseButton;
    }

    if (pauseButton && typeof pauseButton.addEventListener === "function") {
      pauseButton.addEventListener("click", this._onPauseClick);
      this._boundPauseButton = pauseButton;
    }

    if (resumeButton && typeof resumeButton.addEventListener === "function") {
      resumeButton.addEventListener("click", this._onResumeClick);
      this._boundResumeButton = resumeButton;
    }
  }

  unbind() {
    if (this._boundTarget) {
      this._boundTarget.removeEventListener("keydown", this._onKeyDown);
      this._boundTarget = null;
    }

    if (this._boundAccuseButton) {
      this._boundAccuseButton.removeEventListener("click", this._onAccuseClick);
      this._boundAccuseButton = null;
    }

    if (this._boundPauseButton) {
      this._boundPauseButton.removeEventListener("click", this._onPauseClick);
      this._boundPauseButton = null;
    }

    if (this._boundResumeButton) {
      this._boundResumeButton.removeEventListener("click", this._onResumeClick);
      this._boundResumeButton = null;
    }
  }

  _dispatch(action, source) {
    const state = this._getGameState();

    if (!isActionAllowedInState(action, state)) {
      return false;
    }

    const timestamp = this._nowProvider();

    if (TURN_DECISION_ACTIONS.has(action)) {
      if (this._turnDecisionLocked || timestamp < this._turnOpenAtMs) {
        return false;
      }

      this._turnDecisionLocked = true;
    }

    this._onAction({
      action,
      state,
      source,
      timestamp
    });

    return true;
  }

  _handleKeyDown(event) {
    const key = event?.key;

    let handled = false;

    if (key === " " || key === "Spacebar" || key === "Enter") {
      handled = this.handleAccuse("keyboard");
    } else if (key === "Escape") {
      handled =
        this._getGameState() === GameState.PAUSED
          ? this.handleResume("keyboard")
          : this.handlePause("keyboard");
    }

    if (handled && event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    return handled;
  }
}
