import * as assert from "assert";

import translate, { toEmoji } from "./translate";

describe("Translate", () => {
  it("Should translate a text", async () => {
    const result = await translate({
      source: "fr",
      target: "en",
      text: "Salut mec !",
    });

    assert.strictEqual(result, "Hi guy !");
  }).timeout(999999);

  it("Should translate a text to emoji", async () => {
    const result = await toEmoji({
      source: "fr",
      word: "Salut",
    });

    assert.strictEqual(result, "👋");
  }).timeout(999999);
});
