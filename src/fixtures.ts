import axios from "axios";
import * as Chance from "chance";
import * as lodash from "lodash";

import * as audioConverter from "./audio-converter";
import { ClientError } from "./errors";
import * as fileManager from "./file-manager";
import * as models from "./models";
import * as speechToText from "./speech-to-text";
import * as textToSpeech from "./text-to-speech";
import translate from "./translate";

const chance = new Chance();

export const getRandomQuote = async () => {
  const response = await axios.get<{ message: string }>(
    "https://api.whatdoestrumpthink.com/api/v1/quotes/random",
  );

  return response.data.message;
};

const langs = ["fr-FR", "en-US", "es-ES"];

export const generate = async (howMuch: number) => {
  /* const users = */ await Promise.all(
    lodash.range(howMuch).map(async () => {
      const _quote = await getRandomQuote();
      const lang = langs[lodash.random(0, langs.length - 1)];
      const quote = await translate({
        source: "en",
        target: lang,
        text: _quote,
      });

      if (!quote) {
        throw new Error(`Unable to translate quote: ${_quote}, to ${lang}`);
      }

      const [voice] = await textToSpeech.getVoices(lang);

      const fileBuffer = await textToSpeech.synthesize({
        Text: quote,
        VoiceId: voice.Id!,
      });
      const flacFileBuffer = await audioConverter.run(fileBuffer, "flac");
      const compressedFileBuffer = await audioConverter.run(fileBuffer, "mp3");
      const transcription = await speechToText.recognize(flacFileBuffer, lang);

      if (!transcription) {
        throw new ClientError("CANNOT_TRANSCRIPT_TEXT");
      }

      const transaction = await models.sequelize.transaction();
      try {
        const user = await models.User.create(
          {
            answeringMessageRecordingId: null,
            email: chance.email(),
            facebookId: null,
            firstName: chance.first(),
            googleId: null,
            lastName: chance.last(),
            location: {
              coordinates: [chance.longitude(), chance.latitude()],
              type: "Point",
            },
          },
          { transaction },
        );
        const file = await models.File.create(
          {
            contentLength: fileBuffer.length,
            contentType: "audio/mpeg",
            creatorId: user.id,
          },
          { transaction },
        );
        const compressedFile = await models.File.create(
          {
            contentLength: compressedFileBuffer.length,
            contentType: "audio/mpeg",
            creatorId: user.id,
          },
          { transaction },
        );
        const recording = await models.Recording.create(
          {
            compressedFileId: compressedFile.id,
            creatorId: user.id,
            languageCode: lang,
            originalFileId: file.id,
            transcript: transcription.transcript,
            transcriptConfidence: transcription.confidence,
            transcriptWords: transcription.words,
          },
          { transaction },
        );
        user.answeringMessageRecordingId = recording.id;
        await user.save({ transaction });
        await fileManager.putObject({
          Body: fileBuffer,
          ContentType: "audio/mpeg",
          Key: file.id,
        });
        await fileManager.putObject({
          Body: compressedFileBuffer,
          ContentType: "audio/mpeg",
          Key: compressedFile.id,
        });

        await transaction.commit();
      } catch (e) {
        await transaction.rollback();
        throw e;
      }
    }),
  );
};
