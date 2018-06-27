import * as Raven from "raven";
import { IUserInstance } from "./models";

export interface IGraphQLContext {
  user?: IUserInstance;
  raven: Raven.Client;
}

export interface IAuthenticatedGraphQLContext extends IGraphQLContext {
  user: IUserInstance;
}

export const make = ({ raven }: { raven: Raven.Client }): IGraphQLContext => ({
  raven,
});
