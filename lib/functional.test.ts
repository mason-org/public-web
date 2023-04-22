import { groupBy } from "./functional"

describe("functional :: groupBy", () => {
  it("should group by field", () => {
    expect(
      groupBy(
        [
          { color: "red", item: "apple" },
          { color: "yellow", item: "banana" },
          { color: "red", item: "tomato" },
        ],
        "color"
      )
    ).toEqual([
      [
        { color: "red", item: "apple" },
        { color: "red", item: "tomato" },
      ],
      [{ color: "yellow", item: "banana" }],
    ])
  })
})
