import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";
import * as GraphQLDate from "graphql-date";

import { IGraphQLContext } from "../context";
import * as jwt from "../jwt";
import * as models from "../models";
import { ISessionInstance } from "../models/session";
import User, { IUserSource } from "./user";

export interface ISessionSource extends ISessionInstance {
  fresh?: boolean;
}

const config: GraphQLObjectTypeConfig<ISessionSource, IGraphQLContext> = {
  fields: () => ({
    authToken: {
      description:
        "An expiring JWT token you can inspect to know his expiration date https://jwt.io/",
      resolve: (session): Promise<string> => {
        if (!session.fresh) {
          throw new Error("Cannot create an auth token for this session");
        }
        if (session.revokedAt) {
          throw new Error(
            "Cannot generate an accessToken for a revoked session",
          );
        }
        return jwt.signAccessToken({
          session_id: session.id,
          user_id: session.userId,
        });
      },
      type: new GraphQLNonNull(GraphQLString),
    },
    refreshToken: {
      description: "A token to keep so you can refresh your authToken",
      resolve: (session): Promise<string> => {
        if (!session.fresh) {
          throw new Error("Cannot create a refresh token for this session");
        }
        if (session.revokedAt) {
          throw new Error(
            "Cannot generate an refreshToken for a revoked session",
          );
        }
        return jwt.signRefreshToken({
          session_id: session.id,
        });
      },
      type: new GraphQLNonNull(GraphQLString),
    },
    revokedAt: {
      resolve: (session): Date | null => {
        return session.revokedAt;
      },
      type: GraphQLDate,
    },
    user: {
      resolve: async (session): Promise<IUserSource> => {
        const user = await models.User.findById(session.id);
        if (!user) {
          throw new Error("Unexpected: User not found");
        }
        return user;
      },
      type: new GraphQLNonNull(User),
    },
  }),
  name: "Session",
};

const Session = new GraphQLObjectType(config);

export default Session;
