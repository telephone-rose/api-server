import { GraphQLError } from "graphql";
import * as Raven from "raven";
import * as uuid from "uuid";

export class InternalServerError extends Error {
  constructor(
    public message: string,
    public extra: { [key: string]: any } = {},
  ) {
    super(message);
  }
}

type TClientErrorCode =
  | "GOOGLE_AUHT_ERROR_CANNOT_VERIFY_ID_TOKEN"
  | "GOOGLE_AUHT_ERROR_CANNOT_GET_TOKEN_PAYLOAD"
  | "GOOGLE_AUTH_ERROR_INSUFFICIENT_TOKEN_PERMISSIONS"
  | "FACEBOOK_AUTH_ERROR_CANNOT_VERIFY_ID_TOKEN"
  | "FACEBOOK_AUTH_ERROR_INSUFFICIENT_TOKEN_PERMISSIONS"
  | "INVALID_ACCESS_TOKEN"
  | "INVALID_REFRESH_TOKEN"
  | "PERMISSION_DENIED"
  | "SESSION_REVOKED"
  | "SESSION_NOT_FOUND";

export class ClientError extends Error {
  constructor(
    public code: TClientErrorCode,
    public extra: { [key: string]: any } = {},
  ) {
    super();
  }
}

export const formatGraphQLErrors = (
  errors: ReadonlyArray<GraphQLError>,
  raven: Raven.Client,
) =>
  errors.map(error => {
    const id = uuid.v4();
    if (error.originalError) {
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
      }
      if (error.originalError instanceof ClientError) {
        return {
          code: error.originalError.code,
          locations: error.locations,
          message: "Client Error",
          path: error.path,
        };
      }
    }

    raven.captureException(error, { extra: { id } });
    return {
      id,
      message: "Internal Server Error",
    };
  });
