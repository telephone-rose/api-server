import { IUserInstance } from "./models";

export interface IGraphQLContext {
  user?: IUserInstance;
}

export const make = (): IGraphQLContext => ({});
