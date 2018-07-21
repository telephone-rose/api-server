import axios from "axios";
import * as config from "config";
import { graphqlHandler } from "..";

const facebookAppId = config.get<string>("app.facebookAppId");
const facebookAppSecret = config.get<string>("app.facebookAppSecret");

export const generateAppAccessToken = async () => {
  const appAccessTokenResponse = await axios.get(
    `https://graph.facebook.com/oauth/access_token?client_id=${facebookAppId}&client_secret=${facebookAppSecret}&grant_type=client_credentials`,
  );

  return appAccessTokenResponse.data.access_token;
};

export interface IFacebookTestUser {
  id: string;
  access_token: string;
  login_url: string;
  email: string;
  password: string;
}

export const generateFacebookTestUser = async ({
  installed = true,
  permissions = [],
}: {
  permissions?: string[];
  installed?: boolean;
} = {}) => {
  const postTestUserResponse = await axios.post(
    `https://graph.facebook.com/v3.0/${facebookAppId}/accounts/test-users?access_token=${await generateAppAccessToken()}`,
    { installed, permissions: permissions.join(",") },
  );

  return postTestUserResponse.data as IFacebookTestUser;
};

export const testGraphQLHandler = (query: string, variables: any = {}) =>
  new Promise<any>((resolve, reject) =>
    graphqlHandler(
      {
        body: JSON.stringify({
          query,
          variables,
        }),
        headers: {},
        httpMethod: "POST",
        isBase64Encoded: false,
        path: "/graphql",
        pathParameters: {},
        queryStringParameters: {},
        requestContext: {
          accountId: "",
          apiId: "",
          httpMethod: "POST",
          identity: {
            accessKey: null,
            accountId: null,
            apiKey: null,
            apiKeyId: null,
            caller: null,
            cognitoAuthenticationProvider: null,
            cognitoAuthenticationType: null,
            cognitoIdentityId: null,
            cognitoIdentityPoolId: null,
            sourceIp: "",
            user: null,
            userAgent: null,
            userArn: null,
          },
          path: "/graphql",
          requestId: "",
          requestTimeEpoch: 32,
          resourceId: "",
          resourcePath: "/graphql",
          stage: "test",
        },
        resource: "",
        stageVariables: {},
      },
      {
        awsRequestId: "",
        callbackWaitsForEmptyEventLoop: true,
        done: () => null,
        fail: () => null,
        functionName: "graphql",
        functionVersion: "",
        getRemainingTimeInMillis: () => 0,
        invokedFunctionArn: "",
        logGroupName: "",
        logStreamName: "",
        memoryLimitInMB: 512,
        succeed: () => null,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(JSON.parse(result.body));
      },
    ),
  );
