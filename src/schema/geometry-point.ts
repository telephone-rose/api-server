import {
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
} from "graphql";

const config: GraphQLObjectTypeConfig<{}, {}> = {
  fields: () => ({
    latitude: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    longitude: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
  }),
  name: "GeometryPoint",
};

export default new GraphQLObjectType(config);
