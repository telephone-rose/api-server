import * as Redis from "ioredis";

export const createClient = ({ keyPrefix }: { keyPrefix: string }) =>
  new Redis({
    host: process.env.REDIS_HOST,
    keyPrefix,
  });
