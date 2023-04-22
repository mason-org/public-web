import { parseSearch } from "."

describe("SearchInput", function () {
  it("should match values and keywords", () => {
    expect(parseSearch(`This is a "test lol" whatdo:youmean with:"a test"`)).toEqual({
      raw: `This is a "test lol" whatdo:youmean with:"a test"`,
      values: ["This", "is", "a", `test lol`],
      keywords: [
        { keyword: "whatdo", value: "youmean" },
        { keyword: "with", value: "a test" },
      ],
    })
  })

  it("should match same keywords", () => {
    expect(parseSearch(`language:json language:bash`)).toEqual({
      raw: `language:json language:bash`,
      values: [],
      keywords: [
        { keyword: "language", value: "json" },
        { keyword: "language", value: "bash" },
      ],
    })
  })
})
