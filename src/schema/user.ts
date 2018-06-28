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

import { IGraphQLContext } from "../context";
import * as models from "../models";
import { IUserInstance } from "../models/user";
import * as permissions from "../permissions";
import Conversation from "./conversation";
import CursorPaginationInput from "./cursor-pagination-input";
import File from "./file";
import GeometryPoint, {
  ISource as IGeometryPointSource,
} from "./geometry-point";
import GeometryPointInput from "./geometry-point-input";
import OffsetPaginationInput, {
  IOffsetPaginationOutput,
} from "./offset-pagination-input";
import Session, { ISessionSource } from "./session";

export interface IUserSource extends IUserInstance {}

const config: GraphQLObjectTypeConfig<IUserSource, IGraphQLContext> = {
  fields: () => ({
    answeringMessage: {
      resolve: () => null,
      type: File,
    },
    conversationCount: {
      resolve: (): number => 0,
      type: new GraphQLNonNull(GraphQLInt),
    },
    conversations: {
      args: {
        pagination: {
          type: new GraphQLNonNull(CursorPaginationInput),
        },
      },
      resolve: () => [],
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(Conversation)),
      ),
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
      resolve: (user): IGeometryPointSource | null => user.location,
      type: GeometryPoint,
    },
    randomUserFeed: {
      args: {
        location: {
          defaultValue:
            "Search for user near that location, if ommited will search neat the user location, and if nothing is set will search for random stuff",
          type: GeometryPointInput,
        },
      },
      resolve: () => [],
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
