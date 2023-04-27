import { groupBy } from "./functional"

describe("functional :: groupBy", () => {
  it("should groupBy field", () => {
    expect(
      groupBy(
        [
          { color: "red", item: "apple" },
          { color: "yellow", item: "banana" },
          { color: "red", item: "tomato" },
        ],
        "color"
      )
    ).toEqual({
      red: [
        { color: "red", item: "apple" },
        { color: "red", item: "tomato" },
      ],
      yellow: [{ color: "yellow", item: "banana" }],
    })
  })
})
