import axios from "axios";
import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

import * as models from "./models";

const UserType = new GraphQLObjectType({
  fields: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  name: "User",
});

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    fields: {
      ip: {
        description: "Return the server public ip for debugging purpose",
        resolve: async () => {
          const result = await axios.get("https://api.ipify.org?format=json");

          return result.data.ip;
        },
        type: new GraphQLNonNull(GraphQLString),
      },
      users: {
        args: {
          limit: {
            type: new GraphQLNonNull(GraphQLInt),
          },
        },
        resolve: async (_, { limit }) => {
          return models.User.findAll({ limit });
        },
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      },
    },
    name: "RootQuery",
  }),
});
