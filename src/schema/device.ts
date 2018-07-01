import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import { IGraphQLContext } from "../context";
import { ClientError } from "../errors";
import * as models from "../models";
import { IDeviceInstance } from "../models/device";
import User, { IUserSource } from "./user";

export interface IDeviceSource extends IDeviceInstance {}

const config: GraphQLObjectTypeConfig<IDeviceSource, IGraphQLContext> = {
  fields: () => ({
    id: {
      resolve: (device): string => device.id,
      type: new GraphQLNonNull(GraphQLID),
    },
    token: {
      resolve: (device, _, context) => {
        if (!context.user || context.user.id !== device.userId) {
          throw new ClientError("PERMISSION_DENIED");
        }
        return device.token;
      },
      type: new GraphQLNonNull(GraphQLString),
    },
    type: {
      resolve: (device, _, context) => {
        if (!context.user || context.user.id !== device.userId) {
          throw new ClientError("PERMISSION_DENIED");
        }
        return device.type;
      },
      type: new GraphQLNonNull(GraphQLString),
    },
    user: {
      resolve: async (device): Promise<IUserSource> => {
        return (await models.User.findById(device.userId))!;
      },
      type: new GraphQLNonNull(User),
    },
    userId: {
      resolve: (device): string => {
        return device.userId;
      },
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
  name: "Device",
};

export default new GraphQLObjectType(config);
