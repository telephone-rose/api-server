import {
  GraphQLInputObjectType,
  GraphQLInputObjectTypeConfig,
  GraphQLInt,
  GraphQLNonNull,
} from "graphql";

export interface IOffsetPaginationOutput {
  limit: number;
  offset: number;
}

const config: GraphQLInputObjectTypeConfig = {
  fields: () => ({
    limit: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    offset: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  }),
  name: "OffsetPaginationInput",
};

export default new GraphQLInputObjectType(config);
