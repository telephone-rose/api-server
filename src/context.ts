import * as Raven from "raven";

import { IAccessTokenPayload } from "./jwt";
import { IUserInstance } from "./models/user";

export interface IGraphQLContext {
  accessTokenPayload?: IAccessTokenPayload;
  user?: IUserInstance;
  raven: Raven.Client;
}

export interface IAuthenticatedGraphQLContext extends IGraphQLContext {
  user: IUserInstance;
}

export const make = ({ raven }: { raven: Raven.Client }): IGraphQLContext => ({
  raven,
});
