import { beforeEach, describe, expect, it } from "vitest";
import { GameState } from "../../src/core/game-state.js";
import { EvaluationOutcome } from "../../src/systems/evaluation-logic.js";
import {
  buildEndStateMessage,
  buildOutcomeMessage,
  createBasicUiFeedback
} from "../../src/ui/basic-ui-feedback.js";

describe("basic UI feedback", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <p id="statementText"></p>
        <p id="statementTimer"></p>
        <p id="trustValue"></p>
        <p id="progressValue"></p>
        <p id="outcomeBanner"></p>
        <p id="endStateMessage"></p>
      </main>
    `;
  });

  it("maps every core outcome to approved banner copy", () => {
    const scenarios = [
      [EvaluationOutcome.CORRECT_ACCUSATION, "Contradiction found."],
      [EvaluationOutcome.CORRECT_RESTRAINT, "Statement holds."],
      [EvaluationOutcome.FALSE_ACCUSATION, "That was truthful."],
      [EvaluationOutcome.MISSED_LIE, "Lie missed."]
    ];

    for (const [outcome, expected] of scenarios) {
      expect(buildOutcomeMessage(outcome)).toBe(expected);
    }
  });

  it("renders snapshot values into the DOM", () => {
    const ui = createBasicUiFeedback(document);
    const didRender = ui.renderSnapshot({
      statementText: "The hallway camera was offline.",
      statementTimerMs: 2450,
      trust: 87,
      evidenceProgress: 60,
      evidenceRequired: 100
    });

    expect(ui.isReady).toBe(true);
    expect(didRender).toBe(true);
    expect(document.getElementById("statementText")?.textContent).toBe(
      "The hallway camera was offline."
    );
    expect(document.getElementById("statementTimer")?.textContent).toBe("Timer: 2.5s");
    expect(document.getElementById("trustValue")?.textContent).toBe("Trust: 87%");
    expect(document.getElementById("progressValue")?.textContent).toBe("Evidence: 60 / 100");
  });

  it("renders each core outcome banner path", () => {
    const ui = createBasicUiFeedback(document);
    const scenarios = [
      [EvaluationOutcome.CORRECT_ACCUSATION, "Contradiction found."],
      [EvaluationOutcome.CORRECT_RESTRAINT, "Statement holds."],
      [EvaluationOutcome.FALSE_ACCUSATION, "That was truthful."],
      [EvaluationOutcome.MISSED_LIE, "Lie missed."]
    ];

    for (const [outcome, expected] of scenarios) {
      const didRender = ui.renderOutcome(outcome);
      expect(didRender).toBe(true);
      expect(document.getElementById("outcomeBanner")?.textContent).toBe(expected);
    }
  });

  it("renders and clears end-state feedback", () => {
    const ui = createBasicUiFeedback(document);

    expect(
      buildEndStateMessage({
        state: GameState.CASE_FAILURE,
        reason: "Trust depleted."
      })
    ).toBe("Case failed. Trust depleted.");

    ui.renderEndState({ state: GameState.CASE_SUCCESS });
    expect(document.getElementById("endStateMessage")?.textContent).toBe("Case solved.");

    ui.renderEndState();
    expect(document.getElementById("endStateMessage")?.textContent).toBe("");
  });

  it("returns false when required DOM elements are missing", () => {
    document.body.innerHTML = `<main></main>`;
    const ui = createBasicUiFeedback(document);

    expect(ui.isReady).toBe(false);
    expect(ui.renderSnapshot()).toBe(false);
    expect(ui.renderOutcome(EvaluationOutcome.CORRECT_ACCUSATION)).toBe(false);
    expect(ui.renderEndState({ state: GameState.CASE_SUCCESS })).toBe(false);
    expect(ui.clearOutcome()).toBe(false);
  });
});
