import axios from "axios";
import * as config from "config";
import * as redis from "./redis";

import logger from "./logger";

const googleCloudPlatformAPIKey = config.get("app.googleCloudPlatformAPIKey");
const redisClient = redis.createClient({ keyPrefix: "geocoding" });

const _reverse = async ({
  latitude,
  longitude,
  language,
}: {
  latitude: number;
  longitude: number;
  language: string;
}) => {
  const result = await axios.post<
    | {
        results?: Array<{
          address_components: Array<{
            long_name: string;
            short_name: string;
            types: string[];
          }>;
          formatted_address: string;
          geometry: {
            location: {
              lat: number;
              lng: number;
            };
            location_type: string;
            viewport: {
              [direction: string]: {
                lat: number;
                lng: number;
              };
            };
          };
          place_id: string;
          types: string[];
        }>;
      }
    | undefined
  >(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=${language}&key=${googleCloudPlatformAPIKey}`,
    {},
  );

  logger.info("Reverse geocode result", result.data);

  if (!result.data || !result.data.results) {
    return null;
  }

  return result.data.results[0];
};

export const reverse = async ({
  latitude,
  longitude,
  language: _language = "fr",
}: {
  latitude: number;
  longitude: number;
  language?: string;
}): ReturnType<typeof _reverse> => {
  const language = _language.substring(0, 2);
  const cacheKey = `reverse:${latitude}:${longitude}:${language}`;
  const cachedResult = await redisClient.get(cacheKey);
  if (cachedResult) {
    return JSON.parse(cachedResult);
  }

  const result = await _reverse({ language, latitude, longitude });

  await redisClient.setex(cacheKey, 60 * 60, JSON.stringify(result));

  return result;
};
