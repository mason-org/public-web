import { requiredEnv } from "./env"

describe("requiredEnv", () => {
  it("should throw error if env is not set", () => {
    delete process.env.MISSING_ENV;
    expect(() => requiredEnv("MISSING_ENV")).toThrow(new Error("$MISSING_ENV is not set."))
  })

  it("should return env variable", () => {
    process.env.MY_ENV = "var"
    expect(requiredEnv("MY_ENV")).toBe("var")
  })
})
