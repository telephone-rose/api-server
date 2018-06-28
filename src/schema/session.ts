import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";
import * as GraphQLDate from "graphql-date";

import { IGraphQLContext } from "../context";
import { ClientError, InternalServerError } from "../errors";
import * as jwt from "../jwt";
import * as models from "../models";
import { ISessionInstance } from "../models/session";
import User, { IUserSource } from "./user";

export interface ISessionSource extends ISessionInstance {}

const config: GraphQLObjectTypeConfig<ISessionSource, IGraphQLContext> = {
  fields: () => ({
    authToken: {
      description:
        "An expiring JWT token you can inspect to know his expiration date https://jwt.io/",
      resolve: (session): Promise<string> => {
        if (session.revokedAt) {
          throw new ClientError("SESSION_REVOKED");
        }

        if (new Date().getTime() - session.createdAt.getTime() > 3000) {
          throw new ClientError("SESSION_REVOKED");
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
        if (session.revokedAt) {
          throw new ClientError("SESSION_REVOKED");
        }

        if (new Date().getTime() - session.createdAt.getTime() > 3000) {
          throw new ClientError("SESSION_REVOKED");
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
        const user = await models.User.findById(session.userId);
        if (!user) {
          throw new InternalServerError("User not found", { session });
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
