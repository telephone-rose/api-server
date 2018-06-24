import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLString,
} from "graphql";

import DeviceType from "./device-type";
import File from "./file";
import GeometryPointInput from "./geometry-point-input";
import Message from "./message";
import Session from "./session";

const config: GraphQLObjectTypeConfig<{}, {}> = {
  fields: () => ({
    loginUsingFacebook: {
      args: {
        facebookToken: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      type: new GraphQLNonNull(Session),
    },
    logout: {
      args: {
        devicePushToken: {
          description:
            "Optionnaly, pass the device push token so it won't receive push anymore",
          type: GraphQLString,
        },
      },
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    registerPushToken: {
      args: {
        devicePushToken: {
          description:
            "Optionnaly, pass the device push token so it won't receive push anymore",
          type: new GraphQLNonNull(GraphQLString),
        },
        deviceType: {
          type: new GraphQLNonNull(DeviceType),
        },
      },
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    requestFileUpload: {
      args: {
        contentLength: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        contentType: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      type: new GraphQLNonNull(File),
    },
    sendMessage: {
      args: {
        recipientId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        recordingFileId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      type: new GraphQLNonNull(Message),
    },
    sendUserLocation: {
      args: {
        location: {
          type: new GraphQLNonNull(GeometryPointInput),
        },
      },
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    updageAnsweringMessage: {
      args: {
        recordingFileId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      type: new GraphQLNonNull(File),
    },
  }),
  name: "RootMutation",
};

export default new GraphQLObjectType(config);
