import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import { IGraphQLContext } from "../context";
import { ClientError, InternalServerError } from "../errors";
import * as googleAuth from "../google-auth";
import * as jwt from "../jwt";
import * as models from "../models";
import DeviceType from "./device-type";
import File from "./file";
import GeometryPointInput from "./geometry-point-input";
import Message from "./message";
import Session, { ISessionSource } from "./session";

const config: GraphQLObjectTypeConfig<{}, IGraphQLContext> = {
  fields: () => ({
    loginUsingFacebook: {
      args: {
        facebookToken: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      type: new GraphQLNonNull(Session),
    },
    loginUsingGoogle: {
      args: {
        googleIdToken: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (
        _,
        { googleIdToken }: { googleIdToken: string },
        context,
      ): Promise<ISessionSource> => {
        const googleCreds = await googleAuth.verify(googleIdToken);
        let user = await models.User.find({
          where: { googleId: googleCreds.id },
        });
        if (!user) {
          user = await models.User.create({
            email: googleCreds.email,
            facebookId: null,
            firstName: googleCreds.firstName,
            googleId: googleCreds.id,
            lastName: googleCreds.lastName,
            location: null,
          });
        }
        const session = await models.Session.create({
          revokedAt: null,
          userId: user.id,
        });

        context.user = user;

        return session;
      },
      type: new GraphQLNonNull(Session),
    },
    logout: {
      args: {
        devicePushToken: {
          description:
            "Optionnaly, pass the device push token so it won't receive push anymore",
          type: GraphQLString,
        },
      },
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    refreshAuthToken: {
      args: {
        refreshToken: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (
        _,
        { refreshToken }: { refreshToken: string },
      ): Promise<ISessionSource> => {
        const refreshTokenPayload = await jwt.verifyRefreshToken(refreshToken);
        const session = await models.Session.findById(
          refreshTokenPayload.session_id,
        );
        if (!session) {
          throw new InternalServerError(
            "Unexpected: valid refresh token but session not found",
            { refreshTokenPayload },
          );
        }
        if (session.revokedAt) {
          throw new ClientError("SESSION_REVOKED");
        }

        return session;
      },
      type: new GraphQLNonNull(Session),
    },
    registerPushToken: {
      args: {
        devicePushToken: {
          description:
            "Optionnaly, pass the device push token so it won't receive push anymore",
          type: new GraphQLNonNull(GraphQLString),
        },
        deviceType: {
          type: new GraphQLNonNull(DeviceType),
        },
      },
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    requestFileUpload: {
      args: {
        contentLength: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        contentType: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      type: new GraphQLNonNull(File),
    },
    revokeSessions: {
      args: {
        sessionId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (
        _,
        { sessionId }: { sessionId: string },
        context,
      ): Promise<ISessionSource> => {
        const session = await models.Session.findById(sessionId);
        if (!session || !context.user || context.user.id !== session.id) {
          throw new ClientError("SESSION_NOT_FOUND");
        }
        session.revokedAt = new Date();
        await session.save();

        return session;
      },
      type: new GraphQLNonNull(Session),
    },
    sendMessage: {
      args: {
        recipientId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        recordingFileId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      type: new GraphQLNonNull(Message),
    },
    sendUserLocation: {
      args: {
        location: {
          type: new GraphQLNonNull(GeometryPointInput),
        },
      },
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    updageAnsweringMessage: {
      args: {
        recordingFileId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      type: new GraphQLNonNull(File),
    },
  }),
  name: "RootMutation",
};

export default new GraphQLObjectType(config);
