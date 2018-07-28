import * as models from "./models";
import { createClient as createRedisClient } from "./redis";

const redisClient = createRedisClient({ keyPrefix: "availability" });

export const redis = async () => {
  await redisClient.ping();
};

export const postgres = async () => {
  await models.sequelize.sync();
};
