import { describe, it, expect } from "vitest";
import { isEmail } from "./strings";

describe("isEmail", () => {
  it("accepts valid emails", () => {
    expect(isEmail("user@example.com")).toBe(true);
  });
  it("rejects invalid emails", () => {
    expect(isEmail("userexample.com")).toBe(false);
    expect(isEmail("user@")).toBe(false);
    expect(isEmail("@domain.com")).toBe(false);
  });
});