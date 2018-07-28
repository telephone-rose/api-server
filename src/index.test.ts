import * as assert from "assert";

import * as index from "./";

describe("Test the main endpoint", () => {
  it("Should work", done => {
    index.graphqlHandler(
      {
        body: `{ "query": "{ generalAvailability }" }`,
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
      (status, result) => {
        assert(result.body);
        const jsonResult = JSON.parse(result.body);
        assert.strictEqual(
          typeof jsonResult.data.generalAvailability,
          "boolean",
        );
        return done(status);
      },
    );
  });
});
