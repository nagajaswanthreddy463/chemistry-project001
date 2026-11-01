import { describe, expect, it } from "vitest";
import { QUESTIONS, scoreQuiz } from "@/lib/quiz";

describe("assessment", () => {
  it("has five questions", () => expect(QUESTIONS).toHaveLength(5));
  it("scores all-correct as 5", () => expect(scoreQuiz(QUESTIONS.map((q) => q.answer))).toBe(5));
  it("scores unanswered as 0", () => expect(scoreQuiz(QUESTIONS.map(() => null))).toBe(0));
});
