import axios from "axios";
import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";
import * as Sequelize from "sequelize";

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
    ip: {
      description: "Only useful for debugging purpose",
      resolve: async () => {
        const result = await axios.get("https://api.ipify.org?format=json");

        return result.data.ip;
      },
      type: new GraphQLNonNull(GraphQLString),
    },
    me: {
      resolve: (_, __, context): IUserSource => {
        permissions.assert(permissions.isAuthenticated)(context);

        return context.user!;
      },
      type: new GraphQLNonNull(User),
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

        const where: Sequelize.WhereOptions<IUserInstance> = {
          id: {
            [models.sequelize.Op.notIn]: models.sequelize.literal(`
              ( SELECT "Users".id FROM "Users" )
            `),
          },
        };

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
          offset: pagination.offset,
          order: [orderFn as any],
          where,
        });
      },
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
    },
  }),
  name: "RootQuery",
};

export default new GraphQLObjectType(config);
