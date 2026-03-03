import { describe, expect, it } from "vitest";
import { GAME_STATE_LIST, GameState } from "../../src/core/game-state.js";

const EXPECTED_STATE_NAMES = [
  "PRE_CASE",
  "CASE_BRIEF",
  "STATEMENT_ACTIVE",
  "RESOLUTION",
  "CASE_SUCCESS",
  "CASE_FAILURE",
  "PAUSED"
];

describe("GameState enum", () => {
  it("contains all required state keys and values", () => {
    expect(Object.keys(GameState)).toEqual(EXPECTED_STATE_NAMES);

    for (const stateName of EXPECTED_STATE_NAMES) {
      expect(GameState[stateName]).toBe(stateName);
    }
  });

  it("exports a frozen list of states", () => {
    expect(GAME_STATE_LIST).toEqual(EXPECTED_STATE_NAMES);
    expect(Object.isFrozen(GAME_STATE_LIST)).toBe(true);
  });

  it("is immutable", () => {
    expect(Object.isFrozen(GameState)).toBe(true);

    expect(() => {
      GameState.PRE_CASE = "CHANGED";
    }).toThrow(TypeError);

    expect(GameState.PRE_CASE).toBe("PRE_CASE");
  });
});
