export const GameState = Object.freeze({
  PRE_CASE: "PRE_CASE",
  CASE_BRIEF: "CASE_BRIEF",
  STATEMENT_ACTIVE: "STATEMENT_ACTIVE",
  RESOLUTION: "RESOLUTION",
  CASE_SUCCESS: "CASE_SUCCESS",
  CASE_FAILURE: "CASE_FAILURE",
  PAUSED: "PAUSED"
});

export const GAME_STATE_LIST = Object.freeze(Object.values(GameState));
