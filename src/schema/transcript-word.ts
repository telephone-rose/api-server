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
}

const config: GraphQLObjectTypeConfig<
  ITranscriptWordSource,
  IGraphQLContext
> = {
  fields: () => ({
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
