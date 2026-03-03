function normalizeStatements(statements) {
  if (!Array.isArray(statements)) {
    throw new TypeError("statements must be an array");
  }

  return statements.map((statement, index) => {
    if (!statement || typeof statement !== "object") {
      throw new TypeError("each statement must be an object");
    }

    if (typeof statement.text !== "string" || statement.text.length === 0) {
      throw new TypeError("statement.text must be a non-empty string");
    }

    if (typeof statement.isLie !== "boolean") {
      throw new TypeError("statement.isLie must be a boolean");
    }

    const id = statement.id ?? `statement-${index + 1}`;

    return Object.freeze({
      id: String(id),
      text: statement.text,
      isLie: statement.isLie
    });
  });
}

function hashSeed(seed) {
  const input = String(seed);
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed) {
  let state = hashSeed(seed) || 0x6d2b79f5;

  return function nextRandom() {
    state = (state + 0x6d2b79f5) | 0;
    let output = Math.imul(state ^ (state >>> 15), 1 | state);
    output ^= output + Math.imul(output ^ (output >>> 7), 61 | output);
    return ((output ^ (output >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleDeterministic(items, seed) {
  const shuffled = [...items];
  const random = createSeededRandom(seed);

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export const InstructionOrderMode = Object.freeze({
  AUTHORED: "authored",
  SEEDED: "seeded"
});

export class InstructionGenerator {
  constructor({
    statements,
    order = InstructionOrderMode.AUTHORED,
    seed = 1
  }) {
    const normalized = normalizeStatements(statements);

    if (!Object.values(InstructionOrderMode).includes(order)) {
      throw new TypeError("order must be one of InstructionOrderMode values");
    }

    this._sequence =
      order === InstructionOrderMode.SEEDED
        ? shuffleDeterministic(normalized, seed)
        : [...normalized];

    this._cursor = 0;
  }

  get size() {
    return this._sequence.length;
  }

  get cursor() {
    return this._cursor;
  }

  getCurrentInstruction() {
    const statement = this._sequence[this._cursor];

    if (!statement) {
      return null;
    }

    return {
      ...statement,
      turnIndex: this._cursor
    };
  }

  getInstructionAt(turnIndex) {
    if (!Number.isInteger(turnIndex) || turnIndex < 0) {
      return null;
    }

    const statement = this._sequence[turnIndex];

    if (!statement) {
      return null;
    }

    return {
      ...statement,
      turnIndex
    };
  }

  advance() {
    if (this._cursor < this._sequence.length) {
      this._cursor += 1;
    }

    return this.getCurrentInstruction();
  }

  reset() {
    this._cursor = 0;
    return this.getCurrentInstruction();
  }

  getSequence() {
    return this._sequence.map((statement, turnIndex) => ({
      ...statement,
      turnIndex
    }));
  }
}
