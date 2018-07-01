import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
} from "graphql";
import * as GraphQLDate from "graphql-date";
import * as Sequelize from "sequelize";

import { IGraphQLContext } from "../context";
import * as models from "../models";
import { IConversationInstance } from "../models/conversation";
import { IMessageInstance } from "../models/message";
import CursorPaginationInput, {
  ICursorPaginationOutput,
} from "./cursor-pagination-input";
import Message, { IMessageSource } from "./message";
import User, { IUserSource } from "./user";

export interface IConversationSource extends IConversationInstance {}

const config: GraphQLObjectTypeConfig<IConversationSource, IGraphQLContext> = {
  fields: () => ({
    createdAt: {
      resolve: (conversation): Date => conversation.createdAt,
      type: new GraphQLNonNull(GraphQLDate),
    },
    id: {
      resolve: (conversation): string => conversation.id,
      type: new GraphQLNonNull(GraphQLID),
    },
    latestActivityAt: {
      description:
        "Useful to sort conversations (which are already automatically sorted using this attribute)",
      resolve: (conversation): Date => conversation.latestActivityAt,
      type: new GraphQLNonNull(GraphQLDate),
    },
    members: {
      resolve: async (conversation): Promise<IUserSource[]> => {
        const conversationUsers = await models.ConversationUser.findAll({
          where: { conversationId: conversation.id },
        });

        return models.User.findAll({
          where: {
            id: {
              [Sequelize.Op.in]: conversationUsers.map(
                conversationUser => conversationUser.userId,
              ),
            },
          },
        });
      },
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
    },
    messageCount: {
      resolve: async (conversation): Promise<number> => {
        const count = await models.Message.count({
          where: { conversationId: conversation.id },
        });

        return count;
      },
      type: new GraphQLNonNull(GraphQLInt),
    },
    messages: {
      args: {
        pagination: {
          type: new GraphQLNonNull(CursorPaginationInput),
        },
      },
      resolve: async (
        conversation,
        { pagination }: { pagination: ICursorPaginationOutput },
      ): Promise<IMessageSource[]> => {
        const where: Sequelize.WhereOptions<IMessageInstance> = {
          conversationId: conversation.id,
        };

        if (pagination.beforeId) {
          where.id = { [Sequelize.Op.lt]: parseInt(pagination.beforeId, 10) };
        }

        const messages = await models.Message.findAll({
          limit: pagination.limit,
          order: [["createdAt", "DESC"]],
          where,
        });

        return messages;
      },
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Message))),
    },
  }),
  name: "Conversation",
};

export default new GraphQLObjectType(config);
