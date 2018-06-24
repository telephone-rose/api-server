import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import conversation from "./conversation";
import File from "./file";
import User from "./user";

const config: GraphQLObjectTypeConfig<{}, {}> = {
  fields: () => ({
    conversation: {
      type: new GraphQLNonNull(conversation),
    },
    conversationId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    recipient: {
      type: new GraphQLNonNull(User),
    },
    recipientId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    recording: {
      type: new GraphQLNonNull(File),
    },
    sender: {
      type: new GraphQLNonNull(User),
    },
    senderId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    sentAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
  name: "Message",
};

export default new GraphQLObjectType(config);
