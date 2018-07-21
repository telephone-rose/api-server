import * as assert from "assert";

import translate from "./translate";

describe("Translate", () => {
  it("Should translate a text", async () => {
    const result = await translate({
      source: "fr",
      target: "en",
      text: "Salut mec !",
    }).catch(e => e);

    assert.strictEqual(result, "Hi guy !");
  }).timeout(999999);
});
