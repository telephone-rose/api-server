import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import { IGraphQLContext } from "../context";
import * as models from "../models";
import { IRecordingInstance } from "../models/recording";
import File, { IFileSource } from "./file";

export interface IRecordingSource extends IRecordingInstance {}

const config: GraphQLObjectTypeConfig<IRecordingSource, IGraphQLContext> = {
  fields: () => ({
    compressedFile: {
      resolve: async (recording): Promise<IFileSource> =>
        (await models.File.findById(recording.compressedFileId))!,
      type: new GraphQLNonNull(File),
    },
    compressedFileId: {
      resolve: (recording): string => recording.compressedFileId,
      type: new GraphQLNonNull(GraphQLString),
    },
    id: {
      resolve: (recording): string => recording.id,
      type: new GraphQLNonNull(GraphQLID),
    },
    originalFile: {
      resolve: async (recording): Promise<IFileSource> =>
        (await models.File.findById(recording.originalFileId))!,
      type: new GraphQLNonNull(File),
    },
    originalFileId: {
      resolve: (recording): string => recording.originalFileId,
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
  name: "Recording",
};

export default new GraphQLObjectType(config);
