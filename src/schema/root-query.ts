import axios from "axios";
import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import User from "./user";

const config: GraphQLObjectTypeConfig<{}, {}> = {
  fields: () => ({
    ip: {
      description: "Only usefull for debuging purpose",
      resolve: async () => {
        const result = await axios.get("https://api.ipify.org?format=json");

        return result.data.ip;
      },
      type: new GraphQLNonNull(GraphQLString),
    },
    me: {
      type: new GraphQLNonNull(User),
    },
  }),
  name: "RootQuery",
};

export default new GraphQLObjectType(config);
