import axios from "axios";
import * as config from "config";
import * as redis from "./redis";

import logger from "./logger";

const googleCloudPlatformAPIKey = config.get("app.googleCloudPlatformAPIKey");
const redisClient = redis.createClient({ keyPrefix: "translate" });

const translate = async ({
  target,
  source,
  text,
}: {
  target: string;
  source: string;
  text: string;
}) => {
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

export default async ({
  target,
  source,
  text,
}: {
  target: string;
  source: string;
  text: string;
}) => {
  const key = `${target}:${source}:${text}`;
  const cachedResult = await redisClient.get(key);
  if (cachedResult) {
    return cachedResult;
  }
  const result = await translate({ target, source, text });
  await redisClient.set(key, result);
  return result;
};
