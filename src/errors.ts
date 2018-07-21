import { GraphQLError } from "graphql";
import * as Raven from "raven";
import * as uuid from "uuid";

import logger from "./logger";

export class InternalServerError extends Error {
  public name = "InternalServerError";

  constructor(
    public message: string,
    public extra: { [key: string]: any } = {},
  ) {
    super(message);
  }
}

type TClientErrorCode =
  | "GOOGLE_AUTH_ERROR_CANNOT_VERIFY_ID_TOKEN"
  | "GOOGLE_AUTH_ERROR_CANNOT_GET_TOKEN_PAYLOAD"
  | "GOOGLE_AUTH_ERROR_INSUFFICIENT_TOKEN_PERMISSIONS"
  | "FACEBOOK_AUTH_ERROR_CANNOT_VERIFY_ID_TOKEN"
  | "FACEBOOK_AUTH_ERROR_INSUFFICIENT_TOKEN_PERMISSIONS"
  | "INVALID_ACCESS_TOKEN"
  | "INVALID_REFRESH_TOKEN"
  | "PERMISSION_DENIED"
  | "SESSION_REVOKED"
  | "SESSION_NOT_FOUND"
  | "INVALID_DEVICE_TOKEN"
  | "FILE_NOT_FOUND"
  | "RECORDING_NOT_FOUND"
  | "FILE_NOT_UPLOADED"
  | "RECIPIENT_NOT_FOUND"
  | "CANNOT_TRANSCRIPT_TEXT"
  | "CANNOT_REQUEST_AN_UPLOAD_URL_FOR_AN_ALREADY_UPLOADED_FILE";

export class ClientError extends Error {
  public name = "ClientError";

  constructor(
    public code: TClientErrorCode,
    public extra: { [key: string]: any } = {},
  ) {
    super(code);
  }
}

export const formatGraphQLErrors = (
  errors: ReadonlyArray<GraphQLError>,
  raven: Raven.Client,
) =>
  errors.map(error => {
    const id = uuid.v4();
    if (error.originalError) {
      logger.info("Error", {
        error,
        "error.name": error.name,
        "error.originalError": error.originalError,
        "error.originalError instanceof ClientError":
          error.originalError instanceof ClientError,
        "error.originalError instanceof InternalServerError":
          error.originalError instanceof InternalServerError,
        "error.originalError.name": error.originalError.name,
      });
      if (error.originalError instanceof InternalServerError) {
        raven.captureException(error, {
          extra: {
            ...error.originalError.extra,
            id,
          },
        });
        return {
          id,
          message: "Internal Server Error",
        };
      } else if (error.originalError instanceof ClientError) {
        return {
          code: error.originalError.code,
          locations: error.locations,
          message: "Client Error",
          path: error.path,
        };
      } else {
        raven.captureException(error, {
          extra: {
            ...error.originalError,
            id,
          },
        });
      }
    }

    return error;
  });
