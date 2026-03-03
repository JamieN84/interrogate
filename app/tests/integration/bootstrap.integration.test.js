import { beforeEach, describe, expect, it } from "vitest";
import { bootstrapApp } from "../../public/app.js";

describe("bootstrapApp integration", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main class="app">
        <p id="status">Loading...</p>
        <button id="pingButton" type="button">Ping UI</button>
      </main>
    `;
  });

  it("returns false when required DOM nodes do not exist", () => {
    document.body.innerHTML = `<main class="app"></main>`;
    expect(bootstrapApp(document)).toBe(false);
  });

  it("sets initial status and responds to button click", () => {
    const initialized = bootstrapApp(
      document,
      () => new Date("2026-03-03T10:11:12Z"),
      () => "10:11:12"
    );

    const statusEl = document.getElementById("status");
    const pingButton = document.getElementById("pingButton");

    expect(initialized).toBe(true);
    expect(statusEl?.textContent).toBe("Boilerplate loaded. Ready for local serve test.");

    pingButton?.click();
    expect(statusEl?.textContent).toBe("UI event received at 10:11:12");
  });

  it("unlocks restart at terminal state and resets runtime snapshot", () => {
    document.body.innerHTML = `
      <main class="app">
        <p id="status">Loading...</p>
        <p id="statementText"></p>
        <p id="statementTimer"></p>
        <p id="trustValue"></p>
        <p id="progressValue"></p>
        <p id="outcomeBanner"></p>
        <p id="endStateMessage"></p>
        <button id="pingButton" type="button">Simulate Turn</button>
        <button id="restartButton" type="button" disabled>Restart Case</button>
      </main>
    `;

    const initialized = bootstrapApp(
      document,
      () => new Date("2026-03-03T10:11:12Z"),
      () => "10:11:12"
    );

    const pingButton = document.getElementById("pingButton");
    const restartButton = document.getElementById("restartButton");
    const endStateEl = document.getElementById("endStateMessage");
    const trustValueEl = document.getElementById("trustValue");
    const progressValueEl = document.getElementById("progressValue");

    expect(initialized).toBe(true);
    expect(pingButton?.disabled).toBe(false);
    expect(restartButton?.disabled).toBe(true);

    for (let i = 0; i < 6; i += 1) {
      pingButton?.click();
    }

    expect(endStateEl?.textContent).toBe("Case failed. Trust depleted.");
    expect(pingButton?.disabled).toBe(true);
    expect(restartButton?.disabled).toBe(false);

    restartButton?.click();

    expect(endStateEl?.textContent).toBe("");
    expect(trustValueEl?.textContent).toBe("Trust: 100%");
    expect(progressValueEl?.textContent).toBe("Evidence: 0 / 100");
    expect(pingButton?.disabled).toBe(false);
    expect(restartButton?.disabled).toBe(true);
  });
});
