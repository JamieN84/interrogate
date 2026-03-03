import { describe, expect, it } from "vitest";
import {
  InstructionGenerator,
  InstructionOrderMode
} from "../../src/data/instruction-generator.js";

const SAMPLE_STATEMENTS = [
  { id: "s1", text: "I arrived at 8:00 PM.", isLie: false },
  { id: "s2", text: "I never saw the victim.", isLie: true },
  { id: "s3", text: "My phone was dead all night.", isLie: true },
  { id: "s4", text: "I left before 9:00 PM.", isLie: false },
  { id: "s5", text: "I was alone in my office.", isLie: true }
];

describe("InstructionGenerator", () => {
  it("returns current instruction text/truth flag from static authored data", () => {
    const generator = new InstructionGenerator({
      statements: SAMPLE_STATEMENTS,
      order: InstructionOrderMode.AUTHORED
    });

    expect(generator.getCurrentInstruction()).toEqual({
      id: "s1",
      text: "I arrived at 8:00 PM.",
      isLie: false,
      turnIndex: 0
    });

    generator.advance();

    expect(generator.getCurrentInstruction()).toEqual({
      id: "s2",
      text: "I never saw the victim.",
      isLie: true,
      turnIndex: 1
    });
  });

  it("produces deterministic statement order with fixed seed and data set", () => {
    const first = new InstructionGenerator({
      statements: SAMPLE_STATEMENTS,
      order: InstructionOrderMode.SEEDED,
      seed: "case-001"
    });

    const second = new InstructionGenerator({
      statements: SAMPLE_STATEMENTS,
      order: InstructionOrderMode.SEEDED,
      seed: "case-001"
    });

    expect(first.getSequence().map((item) => item.id)).toEqual(
      second.getSequence().map((item) => item.id)
    );
  });

  it("supports reset and index access without coupling to runtime systems", () => {
    const generator = new InstructionGenerator({
      statements: SAMPLE_STATEMENTS,
      order: InstructionOrderMode.AUTHORED
    });

    generator.advance();
    generator.advance();

    expect(generator.getInstructionAt(3)).toEqual({
      id: "s4",
      text: "I left before 9:00 PM.",
      isLie: false,
      turnIndex: 3
    });

    expect(generator.reset()).toEqual({
      id: "s1",
      text: "I arrived at 8:00 PM.",
      isLie: false,
      turnIndex: 0
    });
  });
});
