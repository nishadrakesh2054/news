export type PollInput = {
  questionNp: string;
  options: string[];
  expiresAt?: Date | null;
};

export type PollValidationResult =
  | { ok: true; data: PollInput }
  | { ok: false; error: string };

export function validatePollCreate(body: unknown): PollValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const input = body as Record<string, unknown>;
  const questionNp = typeof input.questionNp === "string" ? input.questionNp.trim() : "";

  if (!questionNp) {
    return { ok: false, error: "कृपया प्रश्न दिनुहोस्" };
  }

  if (!Array.isArray(input.options)) {
    return { ok: false, error: "कृपया कम्तीमा २ वटा विकल्पहरू दिनुहोस्" };
  }

  const options = input.options
    .filter((opt): opt is string => typeof opt === "string")
    .map((opt) => opt.trim())
    .filter(Boolean);

  if (options.length < 2) {
    return { ok: false, error: "कृपया कम्तीमा २ वटा विकल्पहरू दिनुहोस्" };
  }

  let expiresAt: Date | null | undefined;
  if (input.expiresAt !== undefined && input.expiresAt !== null && input.expiresAt !== "") {
    const date = new Date(String(input.expiresAt));
    if (Number.isNaN(date.getTime())) {
      return { ok: false, error: "Invalid expiry date" };
    }
    expiresAt = date;
  } else if (input.expiresAt === null || input.expiresAt === "") {
    expiresAt = null;
  }

  return { ok: true, data: { questionNp, options, expiresAt } };
}
