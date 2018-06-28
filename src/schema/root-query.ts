import axios from "axios";
import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import { IGraphQLContext } from "../context";
import * as permisssions from "../permissions";
import User, { IUserSource } from "./user";

const config: GraphQLObjectTypeConfig<{}, IGraphQLContext> = {
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
      resolve: (_, __, context): IUserSource => {
        permisssions.assert(permisssions.isAuthenticated)(context);

        return context.user!;
      },
      type: new GraphQLNonNull(User),
    },
  }),
  name: "RootQuery",
};

export default new GraphQLObjectType(config);
