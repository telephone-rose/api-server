import * as assert from "assert";

import haversine from "./haversine";

describe("Haversine", () => {
  it("Should compute the distance between two points in meters", () => {
    const result = haversine(
      // Paris
      { latitude: 48.856638, longitude: 2.352241 },
      // Rennes
      { latitude: 48.08333, longitude: -1.68333 },
    );

    assert.strictEqual(result, 309650.13336141733);
  });
});
