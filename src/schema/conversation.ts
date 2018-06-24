import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
} from "graphql";
import * as GraphQLDate from "graphql-date";

import CursorPaginationInput from "./cursor-pagination-input";
import Message from "./message";
import User from "./user";

const ConversationStatus = new GraphQLEnumType({
  name: "ConversationStatus",
  values: {
    closed: {
      value: "closed",
    },
    open: {
      value: "open",
    },
  },
});

const config: GraphQLObjectTypeConfig<{}, {}> = {
  fields: () => ({
    createdAt: {
      type: new GraphQLNonNull(GraphQLDate),
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    latestActivityAt: {
      description: "Usefull to sort conversations",
      type: new GraphQLNonNull(GraphQLDate),
    },
    members: {
      args: {
        excludeSelf: {
          defaultValue: true,
          type: GraphQLBoolean,
        },
      },
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
    },
    messageCount: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    messages: {
      args: {
        pagination: {
          type: new GraphQLNonNull(CursorPaginationInput),
        },
      },
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Message))),
    },
    status: {
      type: new GraphQLNonNull(ConversationStatus),
    },
  }),
  name: "Conversation",
};

export default new GraphQLObjectType(config);