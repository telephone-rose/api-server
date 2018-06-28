import { IAuthenticatedGraphQLContext, IGraphQLContext } from "./context";
import { ClientError } from "./errors";
import { IUserInstance } from "./models/user";

const _makeError = () => new ClientError("PERMISSION_DENIED");

export const assert = <T>(
  validator: (value: T) => boolean,
  makeError: () => Error = _makeError,
) => (toValidate: T): T => {
  if (!validator(toValidate)) {
    throw makeError();
  }
  return toValidate;
};

export const isAuthenticated = (
  context: IGraphQLContext,
): context is IAuthenticatedGraphQLContext => !!context.user;

export const isSelf = (context: IGraphQLContext) => (user: IUserInstance) =>
  !!context.user && context.user.id === user.id;
