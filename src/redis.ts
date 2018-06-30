import * as config from "config";
import * as Redis from "ioredis";

const redisHost = config.has("app.redisUri")
  ? config.get<string>("app.redisUri")
  : process.env.REDIS_HOST;

export const createClient = ({ keyPrefix }: { keyPrefix: string }) =>
  new Redis({
    host: redisHost,
    keyPrefix,
  });
