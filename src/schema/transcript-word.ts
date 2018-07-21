import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import { IGraphQLContext } from "../context";

export interface ITranscriptWordSource {
  startTime: string;
  endTime: string;
  word: string;
  emoji: string | null;
}

const config: GraphQLObjectTypeConfig<
  ITranscriptWordSource,
  IGraphQLContext
> = {
  fields: () => ({
    emoji: {
      resolve: (tw): string | null => tw.emoji,
      type: GraphQLString,
    },
    endTime: {
      resolve: (tw): string => tw.endTime,
      type: new GraphQLNonNull(GraphQLString),
    },
    startTime: {
      resolve: (tw): string => tw.startTime,
      type: new GraphQLNonNull(GraphQLString),
    },
    word: {
      resolve: (tw): string => tw.word,
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
  name: "TranscriptWord",
};

export default new GraphQLObjectType(config);
