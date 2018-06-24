import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import User from "./user";

const config: GraphQLObjectTypeConfig<{}, {}> = {
  fields: () => ({
    authToken: {
      description:
        "An expiring JWT token you can inspect to know his expiration date https://jwt.io/",
      type: new GraphQLNonNull(GraphQLString),
    },
    refreshToken: {
      description: "A token to keep so you can refresh your authToken",
      type: new GraphQLNonNull(GraphQLString),
    },
    user: {
      type: new GraphQLNonNull(User),
    },
  }),
  name: "Session",
};

const Session = new GraphQLObjectType(config);

export default Session;
