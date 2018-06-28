import { IAuthenticatedGraphQLContext, IGraphQLContext } from "./context";
import { IUserInstance } from "./models/user";

const _makeError = () => new Error("Validation error");

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
