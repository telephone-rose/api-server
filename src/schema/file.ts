import {
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import { IGraphQLContext } from "../context";
import { ClientError } from "../errors";
import * as fileManager from "../file-manager";
import { IFileInstance } from "../models/file";

export interface IFileSource extends IFileInstance {}

const config: GraphQLObjectTypeConfig<IFileSource, IGraphQLContext> = {
  fields: () => ({
    contentLength: {
      resolve: (file): number => file.contentLength,
      type: new GraphQLNonNull(GraphQLInt),
    },
    contentType: {
      resolve: (file): string => file.contentType,
      type: new GraphQLNonNull(GraphQLString),
    },
    downloadUrl: {
      resolve: (file): string => {
        return fileManager.signGetObject({ Expires: 9999, Key: file.id });
      },
      type: new GraphQLNonNull(GraphQLString),
    },
    id: {
      resolve: (file): string => file.id,
      type: new GraphQLNonNull(GraphQLID),
    },
    uploadUrl: {
      description:
        "The message upload URL, thrown an error if the file is already uploaded",
      resolve: async (file): Promise<string> => {
        const headResult = await fileManager
          .headObject({ Key: file.id })
          .catch(e => e);
        if (headResult instanceof Error) {
          return fileManager.signPutObject({
            ContentType: file.contentType,
            Expires: 9999,
            Key: file.id,
          });
        }
        throw new ClientError(
          "CANNOT_REQUEST_AN_UPLOAD_URL_FOR_AN_ALREADY_UPLOADED_FILE",
        );
      },
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
  name: "File",
};

export default new GraphQLObjectType(config);
