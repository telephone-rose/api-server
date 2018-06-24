import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
} from "graphql";

import User from "./user";

const config: GraphQLObjectTypeConfig<{}, {}> = {
  fields: () => ({
    me: {
      type: new GraphQLNonNull(User),
    },
  }),
  name: "RootQuery",
};

export default new GraphQLObjectType(config);
