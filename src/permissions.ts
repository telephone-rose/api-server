import { IAuthenticatedGraphQLContext, IGraphQLContext } from "./context";
import { IUserInstance } from "./models";

export const isAuthenticated = (
  context: IGraphQLContext,
): context is IAuthenticatedGraphQLContext => !!context.user;

export const isSelf = (context: IGraphQLContext, user: IUserInstance) =>
  context.user && context.user.id === user.id;
