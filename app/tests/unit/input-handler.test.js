import { describe, expect, it, vi } from "vitest";
import { GameState } from "../../src/core/game-state.js";
import { InputAction, InputHandler } from "../../src/controllers/input-handler.js";

describe("InputHandler", () => {
  it("enforces one actionable decision per statement turn", () => {
    let currentState = GameState.STATEMENT_ACTIVE;
    let now = 1000;
    const onAction = vi.fn();

    const handler = new InputHandler({
      getGameState: () => currentState,
      onAction,
      nowProvider: () => now
    });

    handler.beginTurn();

    expect(handler.handleAccuse("test")).toBe(true);
    expect(handler.handleAccuse("test")).toBe(false);
    expect(handler.handleTimeout("test")).toBe(false);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: InputAction.ACCUSE })
    );

    now += 100;
    handler.beginTurn();
    expect(handler.handleTimeout("test")).toBe(true);
    expect(onAction).toHaveBeenCalledTimes(2);
    expect(onAction).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: InputAction.NO_INPUT })
    );
  });

  it("ignores inputs in disallowed states", () => {
    let currentState = GameState.RESOLUTION;
    const onAction = vi.fn();

    const handler = new InputHandler({
      getGameState: () => currentState,
      onAction
    });

    handler.beginTurn();

    expect(handler.handleAccuse("test")).toBe(false);
    expect(handler.handleTimeout("test")).toBe(false);
    expect(onAction).not.toHaveBeenCalled();

    currentState = GameState.CASE_SUCCESS;
    expect(handler.handlePause("test")).toBe(false);
    expect(onAction).not.toHaveBeenCalled();
  });

  it("normalizes pause and resume actions based on state", () => {
    let currentState = GameState.CASE_BRIEF;
    const onAction = vi.fn();

    const handler = new InputHandler({
      getGameState: () => currentState,
      onAction
    });

    expect(handler.handlePause("test")).toBe(true);
    expect(onAction).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: InputAction.PAUSE })
    );

    currentState = GameState.PAUSED;
    expect(handler.handlePause("test")).toBe(false);
    expect(handler.handleResume("test")).toBe(true);
    expect(onAction).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: InputAction.RESUME })
    );
  });

  it("ignores repeated turn input before beginTurn unlock", () => {
    const onAction = vi.fn();
    const handler = new InputHandler({
      getGameState: () => GameState.STATEMENT_ACTIVE,
      onAction
    });

    expect(handler.handleAccuse("test")).toBe(false);
    expect(handler.handleTimeout("test")).toBe(false);
    expect(onAction).not.toHaveBeenCalled();
  });

  it("binds keyboard input and prevents default when action is handled", () => {
    let currentState = GameState.STATEMENT_ACTIVE;
    const onAction = vi.fn();
    const target = new EventTarget();

    const handler = new InputHandler({
      getGameState: () => currentState,
      onAction
    });

    handler.beginTurn();
    handler.bind({ target });

    const accuseEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      cancelable: true
    });

    target.dispatchEvent(accuseEvent);
    expect(accuseEvent.defaultPrevented).toBe(true);
    expect(onAction).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: InputAction.ACCUSE, source: "keyboard" })
    );

    currentState = GameState.PAUSED;
    const resumeEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      cancelable: true
    });
    target.dispatchEvent(resumeEvent);
    expect(resumeEvent.defaultPrevented).toBe(true);
    expect(onAction).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: InputAction.RESUME, source: "keyboard" })
    );

    handler.unbind();
  });
});
