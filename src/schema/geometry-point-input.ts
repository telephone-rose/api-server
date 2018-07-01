import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInputObjectTypeConfig,
  GraphQLNonNull,
} from "graphql";

export interface IGeometryPointOutput {
  latitude: number;
  longitude: number;
}

const config: GraphQLInputObjectTypeConfig = {
  fields: () => ({
    latitude: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    longitude: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
  }),
  name: "GeometryPointInput",
};

export default new GraphQLInputObjectType(config);
