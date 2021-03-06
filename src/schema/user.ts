import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";
import * as Sequelize from "sequelize";

import { IGraphQLContext } from "../context";
import { ClientError } from "../errors";
import * as geocoding from "../geocoding";
import haversine from "../haversine";
import * as models from "../models";
import { IUserInstance } from "../models/user";
import * as permissions from "../permissions";
import Conversation, { IConversationSource } from "./conversation";
import GeometryPoint, {
  ISource as IGeometryPointSource,
} from "./geometry-point";
import GeometryPointInput, {
  IGeometryPointOutput,
} from "./geometry-point-input";
import languageCode, { TLanguageCode } from "./language-code";
import OffsetPaginationInput, {
  IOffsetPaginationOutput,
} from "./offset-pagination-input";
import Recording, { IRecordingSource } from "./recording";
import Session, { ISessionSource } from "./session";

export interface IUserSource extends IUserInstance {}

const config: GraphQLObjectTypeConfig<IUserSource, IGraphQLContext> = {
  fields: () => ({
    answeringMessageFile: {
      resolve: async (user): Promise<IRecordingSource | null> => {
        if (!user.answeringMessageRecordingId) {
          return null;
        }
        return models.Recording.findById(user.answeringMessageRecordingId);
      },
      type: Recording,
    },
    city: {
      args: {
        language: {
          type: languageCode,
        },
      },
      resolve: async (
        user,
        { language }: { language: TLanguageCode },
      ): Promise<string | null> => {
        if (!user.location) {
          return null;
        }
        const reverseResult = await geocoding.reverse({
          language,
          latitude: user.location.coordinates[1],
          longitude: user.location.coordinates[0],
        });

        if (!reverseResult) {
          return null;
        }

        const addressComponent = reverseResult.address_components.find(
          component => component.types.includes("locality"),
        );

        if (!addressComponent) {
          return null;
        }

        return addressComponent.long_name;
      },
      type: GraphQLString,
    },
    conversationCount: {
      resolve: async (user): Promise<number> =>
        await models.ConversationUser.count({ where: { userId: user.id } }),
      type: new GraphQLNonNull(GraphQLInt),
    },
    conversations: {
      args: {
        pagination: {
          type: new GraphQLNonNull(OffsetPaginationInput),
        },
      },
      resolve: async (
        user,
        { pagination }: { pagination: IOffsetPaginationOutput },
      ): Promise<IConversationSource[]> => {
        return models.Conversation.findAll({
          include: [
            { model: models.ConversationUser, where: { userId: user.id } },
          ],
          limit: pagination.limit,
          offset: pagination.offset,
          order: [["latestActivityAt", "DESC"]],
        });
      },
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(Conversation)),
      ),
    },
    country: {
      args: {
        language: {
          type: languageCode,
        },
      },
      resolve: async (
        user,
        { language }: { language: TLanguageCode },
      ): Promise<string | null> => {
        if (!user.location) {
          return null;
        }
        const reverseResult = await geocoding.reverse({
          language,
          latitude: user.location.coordinates[1],
          longitude: user.location.coordinates[0],
        });

        if (!reverseResult) {
          return null;
        }

        const addressComponent = reverseResult.address_components.find(
          component => component.types.includes("country"),
        );

        if (!addressComponent) {
          return null;
        }

        return addressComponent.long_name;
      },
      type: GraphQLString,
    },
    distance: {
      args: {
        from: {
          type: GeometryPointInput,
        },
      },
      resolve: (
        user,
        { from }: { from?: IGeometryPointOutput | null },
        context,
      ): number | null => {
        const start = from
          ? from
          : context.user && context.user.location
            ? {
                latitude: context.user.location.coordinates[1],
                longitude: context.user.location.coordinates[0],
              }
            : null;
        const end =
          user && user.location
            ? {
                latitude: user.location.coordinates[1],
                longitude: user.location.coordinates[0],
              }
            : null;

        if (!start || !end) {
          return null;
        }

        return Math.round(haversine(start, end));
      },
      type: GraphQLInt,
    },
    email: {
      resolve: (user, _, context): string => {
        permissions.assert(permissions.isSelf(context))(user);
        return user.email;
      },
      type: new GraphQLNonNull(GraphQLString),
    },
    firstName: {
      resolve: (user): string => user.firstName,
      type: new GraphQLNonNull(GraphQLString),
    },
    hasLinkedHisFacebookAccount: {
      resolve: (user): boolean => !!user.facebookId,
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    hasLinkedHisGoogleAccount: {
      resolve: (user): boolean => !!user.googleId,
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    id: {
      resolve: (user): string => user.id,
      type: new GraphQLNonNull(GraphQLID),
    },
    lastName: {
      description: "The user lastName or his initial",
      resolve: (user, _, context): string =>
        permissions.isSelf(context)
          ? user.lastName
          : user.lastName
            ? `${user.lastName[0]}.`
            : "",
      type: new GraphQLNonNull(GraphQLString),
    },
    location: {
      description:
        "The user exact location, can only be accessed by the user himself",
      resolve: (user, _, context): IGeometryPointSource | null => {
        if (!context.user || context.user.id !== user.id) {
          throw new ClientError("PERMISSION_DENIED");
        }
        return user.location;
      },
      type: GeometryPoint,
    },
    randomUserFeed: {
      args: {
        distance: {
          description: "The distance to search within",
          type: GraphQLInt,
        },
        location: {
          description:
            "Search for user near that location, if omitted will search near the user location, and if nothing is set will search for random stuff",
          type: GeometryPointInput,
        },
        pagination: {
          type: new GraphQLNonNull(OffsetPaginationInput),
        },
      },
      resolve: async (
        user,
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
          : user.location
            ? models.sequelize.fn(
                "ST_MakePoint",
                user.location.coordinates[0],
                user.location.coordinates[1],
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
            [models.sequelize.Op.and]: [
              // TODO: Add tests
              { [models.sequelize.Op.not]: user.id },
              {
                [models.sequelize.Op.notIn]: models.sequelize.literal(`
                  ( SELECT "Users".id FROM "Users"
                    LEFT JOIN "ConversationUsers" C2 on "Users".id = C2."userId"
                    LEFT JOIN "Conversations" C3 on C2."conversationId" = C3.id
                    LEFT JOIN "ConversationUsers" CU on C3.id = CU."conversationId"
                    WHERE "Users".id != ${models.sequelize.escape(user.id)}
                    AND C2."conversationId" IS NOT NULL AND CU."userId" = ${models.sequelize.escape(
                      user.id,
                    )}
                  )
                `),
              },
              {
                [models.sequelize.Op.notIn]: models.sequelize.literal(`
                  ( SELECT "HiddenUsers"."userId" FROM "HiddenUsers"
                    WHERE "HiddenUsers"."byUserId" = ${models.sequelize.escape(
                      user.id,
                    )}
                  )
                `),
              },
              {
                [models.sequelize.Op.notIn]: models.sequelize.literal(`
                  ( SELECT "BlockedUsers"."userId" FROM "BlockedUsers"
                    WHERE "BlockedUsers"."byUserId" = ${models.sequelize.escape(
                      user.id,
                    )}
                  )
                `),
              },
            ],
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
          order: [orderFn as any],
          where,
        });
      },
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
    },
    sessions: {
      args: {
        pagination: {
          type: new GraphQLNonNull(OffsetPaginationInput),
        },
      },
      resolve: async (
        user,
        { pagination }: { pagination: IOffsetPaginationOutput },
        context,
      ): Promise<ISessionSource[]> => {
        permissions.assert(permissions.isSelf(context))(user);
        const sessions = await models.Session.findAll({
          limit: pagination.limit,
          offset: pagination.offset,
          order: [["createdAt", "DESC"]],
          where: { userId: user.id },
        });

        return sessions;
      },
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Session))),
    },
  }),
  name: "User",
};

const User = new GraphQLObjectType(config);

export default User;
