import {
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import * as audioConverter from "../audio-converter";
import { IGraphQLContext } from "../context";
import { ClientError, InternalServerError } from "../errors";
import * as facebookAuth from "../facebook-auth";
import * as fileManager from "../file-manager";
import * as googleAuth from "../google-auth";
import * as jwt from "../jwt";
import * as models from "../models";
import * as speechToText from "../speech-to-text";
import Device, { IDeviceSource } from "./device";
import DeviceType, { TDeviceTypeOutput } from "./device-type";
import File from "./file";
import GeometryPointInput, {
  IGeometryPointOutput,
} from "./geometry-point-input";
import Message, { IMessageSource } from "./message";
import Recording, { IRecordingSource } from "./recording";
import Session, { ISessionSource } from "./session";
import User, { IUserSource } from "./user";

const config: GraphQLObjectTypeConfig<{}, IGraphQLContext> = {
  fields: () => ({
    createRecording: {
      args: {
        fileId: {
          description: "A file ID which point to the recording",
          type: new GraphQLNonNull(GraphQLID),
        },
        languageCode: {
          defaultValue: "en-US",
          description: "The user language code",
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      description:
        "Create a recording from a file, it may takes some time to proceed (~3s)",
      resolve: async (
        _,
        { fileId, languageCode }: { fileId: string; languageCode: string },
        context,
      ): Promise<IRecordingSource> => {
        if (!context.user) {
          throw new ClientError("PERMISSION_DENIED");
        }

        const file = await models.File.findById(fileId);

        if (!file) {
          throw new ClientError("FILE_NOT_FOUND");
        }

        if (file.creatorId !== context.user.id) {
          throw new ClientError("PERMISSION_DENIED");
        }

        const fileContent = await fileManager
          .getObject({ Key: file.id })
          .catch(e => e);
        if (fileContent instanceof Error) {
          throw new ClientError("FILE_NOT_UPLOADED");
        }

        const transaction = await models.sequelize.transaction();

        try {
          const [compressedFile, transcript] = await Promise.all([
            audioConverter
              .run(fileContent.Body, "mp3")
              .then(async compressedFileBuffer => {
                const _compressedFile = await models.File.create(
                  {
                    contentLength: compressedFileBuffer.length,
                    contentType: "audio/mp3",
                    creatorId: file.creatorId,
                  },
                  { transaction },
                );

                await fileManager.putObject({
                  Body: compressedFileBuffer,
                  ContentType: "audio/mp3",
                  Key: _compressedFile.id,
                });

                return _compressedFile;
              }),
            audioConverter
              .run(fileContent.Body, "flac")
              .then(async flacFileBuffer => {
                return speechToText.recognize(flacFileBuffer, languageCode);
              }),
          ]);

          if (!transcript) {
            throw new ClientError("CANNOT_TRANSCRIPT_TEXT");
          }

          const recording = await models.Recording.create(
            {
              compressedFileId: compressedFile.id,
              creatorId: file.creatorId,
              originalFileId: file.id,
              transcript: transcript.transcript,
              transcriptConfidence: transcript.confidence,
              transcriptWords: transcript.words,
            },
            { transaction },
          );

          await transaction.commit();
          return recording;
        } catch (e) {
          await transaction.rollback();
          throw e;
        }
      },
      type: new GraphQLNonNull(Recording),
    },
    loginUsingFacebook: {
      args: {
        facebookToken: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (
        _,
        { facebookToken }: { facebookToken: string },
        context,
      ): Promise<ISessionSource> => {
        const facebookCreds = await facebookAuth.verify(facebookToken);

        let user = await models.User.find({
          where: { facebookId: facebookCreds.id },
        });
        if (!user) {
          user = await models.User.find({
            where: { email: facebookCreds.email },
          });
          if (user) {
            user.facebookId = facebookCreds.id;
            await user.save();
          }

          if (!user) {
            user = await models.User.create({
              answeringMessageRecordingId: null,
              email: facebookCreds.email,
              facebookId: facebookCreds.id,
              firstName: facebookCreds.firstName,
              googleId: null,
              lastName: facebookCreds.lastName,
              location: null,
            });
          }
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
          user = await models.User.find({
            where: { email: googleCreds.email },
          });

          if (user) {
            user.googleId = googleCreds.id;
            await user.save();
          }

          if (!user) {
            user = await models.User.create({
              answeringMessageRecordingId: null,
              email: googleCreds.email,
              facebookId: null,
              firstName: googleCreds.firstName,
              googleId: googleCreds.id,
              lastName: googleCreds.lastName,
              location: null,
            });
          }
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
            "Optionally, pass the device push token so it won't receive push anymore",
          type: GraphQLString,
        },
      },
      resolve: async (
        _,
        { devicePushToken }: { devicePushToken: string },
        context,
      ) => {
        const transaction = await models.sequelize.transaction();

        try {
          if (!context.accessTokenPayload || !context.user) {
            throw new ClientError("PERMISSION_DENIED");
          }
          const session = await models.Session.findById(
            context.accessTokenPayload!.session_id,
            { transaction },
          );
          if (!session) {
            throw new InternalServerError("Session not found", {
              accessTokenPayload: context.accessTokenPayload,
            });
          }
          session.revokedAt = new Date();
          await session.save({ transaction });

          if (devicePushToken) {
            const device = await models.Device.find({
              transaction,
              where: { token: devicePushToken, userId: context.user.id },
            });

            if (!device) {
              throw new ClientError("INVALID_DEVICE_TOKEN");
            }

            await device.destroy({ transaction });
          }

          await transaction.commit();

          return session;
        } catch (e) {
          await transaction.rollback();
          throw e;
        }
      },
      type: new GraphQLNonNull(Session),
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
            "Optionally, pass the device push token so it won't receive push anymore",
          type: new GraphQLNonNull(GraphQLString),
        },
        deviceType: {
          type: new GraphQLNonNull(DeviceType),
        },
      },
      resolve: async (
        _,
        {
          devicePushToken,
          deviceType,
        }: { devicePushToken: string; deviceType: TDeviceTypeOutput },
        context,
      ): Promise<IDeviceSource> => {
        const transaction = await models.sequelize.transaction();

        try {
          if (!context.user) {
            throw new ClientError("PERMISSION_DENIED");
          }

          let device = await models.Device.findOne({
            transaction,
            where: { token: devicePushToken },
          });

          if (device) {
            device.userId = context.user.id;
            device.type = deviceType;
            await device.save({ transaction });
          } else {
            device = await models.Device.create(
              {
                token: devicePushToken,
                type: deviceType,
                userId: context.user.id,
              },
              { transaction },
            );
          }

          await transaction.commit();

          return device;
        } catch (e) {
          await transaction.rollback();
          throw e;
        }
      },
      type: new GraphQLNonNull(Device),
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
      resolve: async (
        _,
        {
          contentLength,
          contentType,
        }: { contentLength: number; contentType: string },
        context,
      ) => {
        if (!context.user) {
          throw new ClientError("PERMISSION_DENIED");
        }
        const file = await models.File.create({
          contentLength,
          contentType,
          creatorId: context.user.id,
        });

        return file;
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
        recordingId: {
          description: "A file ID which point to the recording",
          type: new GraphQLNonNull(GraphQLID),
        },
        text: {
          description: "Only usefull for debuging purposes",
          type: GraphQLString,
        },
      },
      resolve: async (
        _,
        {
          recipientId,
          recordingId,
          text,
        }: {
          recipientId: string;
          recordingId: string;
          text?: string | null;
        },
        context,
      ): Promise<IMessageSource> => {
        if (!context.user) {
          throw new ClientError("PERMISSION_DENIED");
        }
        const recording = await models.Recording.findById(recordingId);
        if (!recording) {
          throw new ClientError("RECORDING_NOT_FOUND");
        }
        if (recording.creatorId !== context.user.id) {
          throw new ClientError("PERMISSION_DENIED");
        }

        const recipient = await models.User.findById(recipientId);
        if (!recipient) {
          throw new ClientError("RECIPIENT_NOT_FOUND");
        }

        const transaction = await models.sequelize.transaction();
        try {
          const now = new Date();
          let conversation = await models.Conversation.findOne({
            include: [
              {
                model: models.ConversationUser,
                where: { userId: context.user.id },
              },
              {
                model: models.ConversationUser,
                where: { userId: recipient.id },
              },
            ],
            transaction,
          });
          if (!conversation) {
            conversation = await models.Conversation.create(
              {
                latestActivityAt: now,
              },
              { transaction },
            );
            await models.ConversationUser.create(
              {
                conversationId: conversation.id,
                userId: context.user.id,
              },
              { transaction },
            );
            await models.ConversationUser.create(
              {
                conversationId: conversation.id,
                userId: recipient.id,
              },
              { transaction },
            );
          } else {
            conversation.latestActivityAt = now;
            await conversation.save({ transaction });
          }

          const message = await models.Message.create(
            {
              conversationId: conversation.id,
              recordingId: recording.id,
              senderId: context.user.id,
              text,
            },
            { transaction },
          );

          await transaction.commit();

          return message;
        } catch (e) {
          await transaction.rollback();
          throw e;
        }
      },
      type: new GraphQLNonNull(Message),
    },
    sendSelfLocation: {
      args: {
        location: {
          type: new GraphQLNonNull(GeometryPointInput),
        },
      },
      resolve: async (
        _,
        {
          location,
        }: {
          location: IGeometryPointOutput;
        },
        context,
      ): Promise<IUserSource> => {
        if (!context.user) {
          throw new ClientError("PERMISSION_DENIED");
        }
        context.user.location = {
          coordinates: [location.longitude, location.latitude],
          type: "Point",
        };

        await context.user.save();

        return context.user;
      },
      type: new GraphQLNonNull(User),
    },
    updateAnsweringMessage: {
      args: {
        recordingId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (
        _,
        {
          recordingId,
        }: {
          recordingId: string;
        },
        context,
      ): Promise<IUserSource> => {
        if (!context.user) {
          throw new ClientError("PERMISSION_DENIED");
        }
        const recording = await models.Recording.findById(recordingId);
        if (!recording) {
          throw new ClientError("RECORDING_NOT_FOUND");
        }
        if (recording.creatorId !== context.user.id) {
          throw new ClientError("PERMISSION_DENIED");
        }

        context.user.answeringMessageRecordingId = recording.id;

        await context.user.save();

        return context.user;
      },
      type: new GraphQLNonNull(User),
    },
  }),
  name: "RootMutation",
};

export default new GraphQLObjectType(config);
