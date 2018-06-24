import { GraphQLSchema } from "graphql";

import RootMutation from "./root-mutation";
import RootQuery from "./root-query";

export default new GraphQLSchema({
  mutation: RootMutation,
  query: RootQuery,
});
