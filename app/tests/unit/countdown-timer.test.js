import { describe, expect, it, vi } from "vitest";
import { CountdownTimer, TimerState } from "../../src/systems/countdown-timer.js";

describe("CountdownTimer", () => {
  it("decrements remaining time while running and clamps at zero", () => {
    const timer = new CountdownTimer();

    timer.start(1000);
    expect(timer.state).toBe(TimerState.RUNNING);
    expect(timer.remainingMs).toBe(1000);

    timer.tick(250);
    expect(timer.remainingMs).toBe(750);
    expect(timer.state).toBe(TimerState.RUNNING);

    timer.tick(2000);
    expect(timer.remainingMs).toBe(0);
    expect(timer.state).toBe(TimerState.EXPIRED);
  });

  it("does not decrement while paused and resumes correctly", () => {
    const timer = new CountdownTimer();

    timer.start(1000);
    timer.tick(100);
    expect(timer.remainingMs).toBe(900);

    expect(timer.pause()).toBe(true);
    expect(timer.state).toBe(TimerState.PAUSED);
    timer.tick(300);
    expect(timer.remainingMs).toBe(900);

    expect(timer.resume()).toBe(true);
    expect(timer.state).toBe(TimerState.RUNNING);
    timer.tick(100);
    expect(timer.remainingMs).toBe(800);
  });

  it("emits expiry callback only once per start cycle", () => {
    const onExpire = vi.fn();
    const timer = new CountdownTimer({ onExpire });

    timer.start(100);
    timer.tick(100);
    timer.tick(100);
    expect(onExpire).toHaveBeenCalledTimes(1);

    timer.start(50);
    timer.tick(50);
    expect(onExpire).toHaveBeenCalledTimes(2);
  });

  it("supports stop and reset lifecycle operations", () => {
    const timer = new CountdownTimer();

    timer.start(500);
    timer.tick(100);
    expect(timer.remainingMs).toBe(400);

    timer.stop();
    expect(timer.state).toBe(TimerState.IDLE);
    timer.tick(100);
    expect(timer.remainingMs).toBe(400);

    timer.reset();
    expect(timer.state).toBe(TimerState.IDLE);
    expect(timer.remainingMs).toBe(500);
  });
});
