import * as assert from "assert";

import * as audioConverter from "./audio-converter";
import * as fixtures from "./fixtures";
import * as speechToText from "./speech-to-text";
import * as textToSpeech from "./text-to-speech";

describe("Speech to text", () => {
  it("Should transform a speech to a text", async () => {
    const randomQuote = await fixtures.getRandomQuote();
    const raw = await textToSpeech.synthesize({
      Text: randomQuote,
      VoiceId: "Justin",
    });

    const flac = await audioConverter.run(raw, "flac");

    const result = await speechToText.recognize(flac, "en-US");

    assert(result);
  }).timeout(999999);
});
