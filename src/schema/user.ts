import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import Conversation from "./conversation";
import CursorPaginationInput from "./cursor-pagination-input";
import File from "./file";
import GeometryPoint from "./geometry-point";
import GeometryPointInput from "./geometry-point-input";

const config: GraphQLObjectTypeConfig<{}, {}> = {
  fields: () => ({
    answeringMessage: {
      type: new GraphQLNonNull(File),
    },
    conversationCount: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    conversations: {
      args: {
        pagination: {
          type: new GraphQLNonNull(CursorPaginationInput),
        },
      },
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(Conversation)),
      ),
    },
    displayName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    lastName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    location: {
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
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
    },
  }),
  name: "User",
};

const User = new GraphQLObjectType(config);

export default User;
