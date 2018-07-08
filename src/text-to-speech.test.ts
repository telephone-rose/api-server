import * as assert from "assert";

import * as textToSpeech from "./text-to-speech";

describe("Text to speech", () => {
  it("should list all available voice ids", async () => {
    const voices = await textToSpeech.getVoices();

    assert(Array.isArray(voices));
  });

  it("should output mp3 buffer", async () => {
    const voices = await textToSpeech.getVoices();

    const output = await textToSpeech.synthesize({
      Text: "Hello world",
      VoiceId: voices[0].Id!,
    });

    assert(output instanceof Buffer);
  });
});
