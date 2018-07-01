import axios from "axios";
import * as Chance from "chance";
import * as lodash from "lodash";

import * as fileManager from "./file-manager";
import * as models from "./models";
import * as textToSpeech from "./text-to-speech";

const chance = new Chance();

const getRandomQuote = async () => {
  const response = await axios.get<{ message: string }>(
    "https://api.whatdoestrumpthink.com/api/v1/quotes/random",
  );

  return response.data.message;
};

export const generate = async (howMuch: number) => {
  const voices = await textToSpeech.getVoices();
  /* const users = */ await Promise.all(
    lodash.range(howMuch).map(async () => {
      const quote = await getRandomQuote();
      const fileBuffer = await textToSpeech.synthesize({
        Text: quote,
        VoiceId: voices[lodash.random(voices.length - 1)],
      });
      const transaction = await models.sequelize.transaction();
      try {
        const user = await models.User.create(
          {
            answeringMessageFileId: null,
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
        user.answeringMessageFileId = file.id;
        await user.save({ transaction });
        await fileManager.putObject({
          Body: fileBuffer,
          ContentType: "audio/mpeg",
          Key: file.id,
        });

        await transaction.commit();
      } catch (e) {
        await transaction.rollback();
        throw e;
      }
    }),
  );
};
