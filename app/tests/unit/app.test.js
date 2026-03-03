import { describe, expect, it } from "vitest";
import { buildPingMessage, buildReadyMessage } from "../../public/app.js";

describe("app message builders", () => {
  it("builds the ready message", () => {
    expect(buildReadyMessage()).toBe("Boilerplate loaded. Ready for local serve test.");
  });

  it("builds the ping message with provided time", () => {
    expect(buildPingMessage("12:34:56")).toBe("UI event received at 12:34:56");
  });
});
