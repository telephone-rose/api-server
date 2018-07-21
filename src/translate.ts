import axios from "axios";
import * as Bluebird from "bluebird";
import * as config from "config";
import * as emojilib from "emojilib";
import * as lodash from "lodash";

import logger from "./logger";
import * as redis from "./redis";

const googleCloudPlatformAPIKey = config.get("app.googleCloudPlatformAPIKey");
const redisClient = redis.createClient({ keyPrefix: "translate" });
const emojiArray = Object.values(emojilib.lib);

const _translate = async ({
  target,
  source,
  text,
}: {
  target: string;
  source: string;
  text: string;
}) => {
  if (source === target) {
    return text;
  }

  const result = await axios.post<
    | {
        data?: {
          translations: Array<{
            translatedText: string;
          }>;
        };
      }
    | undefined
  >(
    `https://translation.googleapis.com/language/translate/v2?key=${googleCloudPlatformAPIKey}`,
    {
      format: "text",
      q: text,
      source,
      target,
    },
  );

  logger.info("Speech to text result", result.data);

  if (
    !result.data ||
    !result.data.data ||
    !result.data.data.translations ||
    result.data.data.translations.length === 0
  ) {
    return null;
  }

  return result.data.data.translations[0].translatedText;
};

export const toEmoji = async ({
  word,
  source,
}: {
  word: string;
  source: string;
}) => {
  const englishWord = await translate({ target: "en", source, text: word });
  if (!englishWord) {
    return null;
  }
  const emojiFound = emojiArray.filter(emoji =>
    emoji.keywords.includes(englishWord.toLowerCase()),
  );
  if (emojiFound.length === 0) {
    return null;
  }
  const randomIndex = lodash.random(0, emojiFound.length - 1);
  const randomEmoji = emojiFound[randomIndex];
  return randomEmoji.char;
};

export const emojiResume = async ({
  source,
  text,
  length,
}: {
  source: string;
  text: string;
  length: number;
}) => {
  const translation = await translate({ target: "en", source, text });

  if (!translation) {
    return translation;
  }

  const words = translation.split(" ").map(word => word.toLowerCase());
  const fullResume = await Bluebird.reduce(
    Object.entries(lodash.countBy(words)),
    async (
      acc: Array<[string, number]>,
      [word, count],
    ): Promise<Array<[string, number]>> => {
      const emoji = await toEmoji({ source: "en", word });
      if (!emoji) {
        return acc;
      }
      return [...acc, [emoji, count]];
    },
    [],
  );

  return fullResume
    .sort(([, aCount], [, bCount]) => aCount - bCount)
    .slice(0, length)
    .map(([word]) => word)
    .join(" ");
};

const translate = async ({
  target: _target,
  source: _source,
  text,
}: {
  target: string;
  source: string;
  text: string;
}) => {
  const target = _target.substring(0, 2);
  const source = _source.substring(0, 2);
  if (source === target) {
    return text;
  }
  const key = `${target}:${source}:${text}`;
  const cachedResult = await redisClient.get(key);
  if (cachedResult) {
    return cachedResult;
  }
  const result = await _translate({ target, source, text });
  await redisClient.set(key, result);
  return result;
};

export default translate;
