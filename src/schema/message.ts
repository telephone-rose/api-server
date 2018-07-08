import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";
import * as GraphQLDate from "graphql-date";

import { IGraphQLContext } from "../context";
import * as models from "../models";
import { IMessageInstance } from "../models/message";
import conversation, { IConversationSource } from "./conversation";
import Recording, { IRecordingSource } from "./recording";
import User, { IUserSource } from "./user";

export interface IMessageSource extends IMessageInstance {}

const config: GraphQLObjectTypeConfig<IMessageSource, IGraphQLContext> = {
  fields: () => ({
    conversation: {
      resolve: async (message): Promise<IConversationSource> =>
        (await models.Conversation.findById(message.conversationId))!,
      type: new GraphQLNonNull(conversation),
    },
    conversationId: {
      resolve: (message): string => message.conversationId,
      type: new GraphQLNonNull(GraphQLString),
    },
    id: {
      resolve: (message): string => message.id.toString(),
      type: new GraphQLNonNull(GraphQLID),
    },
    recording: {
      resolve: async (message): Promise<IRecordingSource> =>
        (await models.Recording.findById(message.recordingId))!,
      type: new GraphQLNonNull(Recording),
    },
    sender: {
      resolve: async (message): Promise<IUserSource> =>
        (await models.User.findById(message.senderId))!,
      type: new GraphQLNonNull(User),
    },
    senderId: {
      resolve: (message): string => message.senderId,
      type: new GraphQLNonNull(GraphQLString),
    },
    sentAt: {
      resolve: (message): Date => message.createdAt,
      type: new GraphQLNonNull(GraphQLDate),
    },
    text: {
      description: "Only for debugging purposes",
      resolve: (message): string | null | undefined => message.text,
      type: GraphQLString,
    },
  }),
  name: "Message",
};

export default new GraphQLObjectType(config);
