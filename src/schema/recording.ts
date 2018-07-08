import {
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import { IGraphQLContext } from "../context";
import * as models from "../models";
import { IRecordingInstance } from "../models/recording";
import File, { IFileSource } from "./file";
import TranscriptWord, { ITranscriptWordSource } from "./transcript-word";

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
    transcript: {
      resolve: (recording): string => recording.transcript,
      type: new GraphQLNonNull(GraphQLString),
    },
    transcriptConfidence: {
      resolve: (recording): number => recording.transcriptConfidence,
      type: new GraphQLNonNull(GraphQLFloat),
    },
    transcriptWords: {
      resolve: (recording): ITranscriptWordSource[] =>
        recording.transcriptWords,
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(TranscriptWord)),
      ),
    },
  }),
  name: "Recording",
};

export default new GraphQLObjectType(config);
