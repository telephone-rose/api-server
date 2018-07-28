import axios from "axios";
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";
import * as Sequelize from "sequelize";

import * as availability from "../availability";
import { IGraphQLContext } from "../context";
import * as models from "../models";
import { IUserInstance } from "../models/user";
import * as permissions from "../permissions";
import GeometryPointInput, {
  IGeometryPointOutput,
} from "./geometry-point-input";
import OffsetPaginationInput, {
  IOffsetPaginationOutput,
} from "./offset-pagination-input";
import User, { IUserSource } from "./user";

const config: GraphQLObjectTypeConfig<{}, IGraphQLContext> = {
  fields: () => ({
    generalAvailability: {
      resolve: async (): Promise<boolean> => {
        try {
          await availability.redis();
          await availability.postgres();
          await axios.get("https://api.ipify.org?format=json");
          return true;
        } catch {
          return false;
        }
      },
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    me: {
      resolve: (_, __, context): IUserSource => {
        permissions.assert(permissions.isAuthenticated)(context);

        return context.user!;
      },
      type: new GraphQLNonNull(User),
    },
    postgresAvailability: {
      resolve: async (): Promise<boolean> => {
        try {
          await availability.postgres();
          return true;
        } catch {
          return false;
        }
      },
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    randomUserFeed: {
      args: {
        distance: {
          description: "The distance to search within",
          type: GraphQLInt,
        },
        location: {
          description: "Search for user near that location",
          type: GeometryPointInput,
        },
        pagination: {
          type: new GraphQLNonNull(OffsetPaginationInput),
        },
      },
      resolve: async (
        _,
        {
          distance,
          location: _location,
          pagination,
        }: {
          distance?: number | null;
          location?: IGeometryPointOutput | null;
          pagination: IOffsetPaginationOutput;
        },
      ) => {
        const location = _location
          ? models.sequelize.fn(
              "ST_MakePoint",
              _location.longitude,
              _location.latitude,
            )
          : null;
        const orderFn = location
          ? models.sequelize.fn(
              "st_distance_sphere",
              models.sequelize.col("location"),
              location,
            )
          : models.sequelize.fn("random");

        const where: Sequelize.WhereOptions<IUserInstance> = {};

        if (location) {
          (where as any)[models.sequelize.Op.or] = [
            { location: { [models.sequelize.Op.is]: null } },
            models.sequelize.fn(
              "ST_DWithin",
              models.sequelize.col("location"),
              location,
              distance,
              true,
            ),
          ];
        }

        return models.User.findAll({
          limit: pagination.limit,
          order: [orderFn as any],
          where,
        });
      },
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
    },
    redisAvailability: {
      resolve: async (): Promise<boolean> => {
        try {
          await availability.redis();
          return true;
        } catch {
          return false;
        }
      },
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    serverOutboundIp: {
      description: "Only useful for debugging purpose",
      resolve: async () => {
        const result = await axios.get("https://api.ipify.org?format=json");

        return result.data.ip;
      },
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
  name: "RootQuery",
};

export default new GraphQLObjectType(config);
