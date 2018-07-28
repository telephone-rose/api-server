import * as assert from "assert";

import * as geocoding from "./geocoding";

describe("Geocoding", () => {
  it("should correctly reverse geocode Rennes", async () => {
    const result = await geocoding.reverse({
      language: "fr",
      latitude: 48.87453559999999,
      longitude: 2.3548236000000315,
    });

    assert(result);
    assert(result!.address_components);

    const city = result!.address_components!.find(component =>
      component.types.includes("locality"),
    );

    assert(city);
    assert.strictEqual(city!.long_name, "Paris");
  });
});
