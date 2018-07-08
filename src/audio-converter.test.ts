import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";

import * as audioConverter from "./audio-converter";

const testAudioPath = path.join(__dirname, "audio-test.mp3");
const testAudioData = fs.readFileSync(testAudioPath);

describe("Audio converter", () => {
  it("should convert files", async () => {
    const opus = await audioConverter.run(testAudioData, "opus");

    assert(Buffer.isBuffer(opus));

    const mp3 = await audioConverter.run(opus, "mp3");

    assert(Buffer.isBuffer(mp3));
  }).timeout(10000);
});
