import {
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

const config: GraphQLObjectTypeConfig<{}, {}> = {
  fields: () => ({
    contentLength: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    contentType: {
      type: new GraphQLNonNull(GraphQLString),
    },
    downloadUrl: {
      type: new GraphQLNonNull(GraphQLString),
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    uploadUrl: {
      description:
        "The message upload URL, thrown an error if the file is already uploaded",
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
  name: "File",
};

export default new GraphQLObjectType(config);
