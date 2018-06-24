import * as Redis from "ioredis";

export const createClient = () =>
  new Redis({
    host: process.env.REDIS_HOST,
  });
