import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInputObjectTypeConfig,
  GraphQLInt,
  GraphQLNonNull,
} from "graphql";

export interface ICursorPaginationOutput {
  beforeId?: string | null;
  limit: number;
}

const config: GraphQLInputObjectTypeConfig = {
  fields: () => ({
    beforeId: {
      type: GraphQLID,
    },
    limit: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  }),
  name: "CursorPaginationInput",
};

export default new GraphQLInputObjectType(config);
