import {
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
} from "graphql";

import { IGraphQLContext } from "../context";

export interface ISource {
  type: "Point";
  coordinates: [number, number];
}

const config: GraphQLObjectTypeConfig<ISource, IGraphQLContext> = {
  fields: () => ({
    latitude: {
      resolve: (source): number => source.coordinates[0],
      type: new GraphQLNonNull(GraphQLFloat),
    },
    longitude: {
      resolve: (source): number => source.coordinates[0],
      type: new GraphQLNonNull(GraphQLFloat),
    },
  }),
  name: "GeometryPoint",
};

export default new GraphQLObjectType(config);
