import "source-map-support/register";

import * as config from "config";
import * as Raven from "raven";
const ravenDsn = config.get<string>("app.ravenDsn");

Raven.config(ravenDsn, {
  autoBreadcrumbs: true,
  captureUnhandledRejections: true,
}).install();

import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { graphql } from "graphql";

import { make as makeGraphQLContext } from "./context";
import * as jwt from "./jwt";
import { sequelize } from "./models";
import * as models from "./models";
import schema from "./schema";

export const graphqlHandler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback,
) => {
  try {
    const raven = new Raven.Client(ravenDsn, {
      autoBreadcrumbs: true,
      captureUnhandledRejections: true,
      extra: {
        awsRequestId: context.awsRequestId,
        functionName: context.functionName,
      },
      release: context.functionVersion,
    });

    context.callbackWaitsForEmptyEventLoop = false;

    const responseHeaders = {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": event.headers ? event.headers.origin : "*",
      "Content-Type": "application/json",
    };

    const stringQuery =
      event.httpMethod === "POST" ? event.body : event.queryStringParameters;

    if (typeof stringQuery !== "string") {
      return callback(null, {
        body: JSON.stringify({ error: "Empty GraphQL Query" }),
        headers: responseHeaders,
        statusCode: 400,
      });
    }

    let query: any = null;
    try {
      query = JSON.parse(stringQuery);
    } catch (e) {
      return callback(null, {
        body: JSON.stringify({ error: "Unable to parse query", got: query }),
        headers: responseHeaders,
        statusCode: 400,
      });
    }

    const graphQLContext = makeGraphQLContext({ raven });

    if (event.headers && event.headers.authorization) {
      const authHeaderBearerRegexp = /Bearer (.*)/;
      const authHeaderBearerRegexpMatch = authHeaderBearerRegexp.exec(
        event.headers.authorization,
      );

      if (!authHeaderBearerRegexpMatch) {
        return callback(null, {
          body: JSON.stringify({
            error: "Invalid authorization bearer format",
            expected: "Bearer: *token*",
            got: event.headers.authorization,
          }),
          headers: responseHeaders,
          statusCode: 400,
        });
      }

      const bearerToken = authHeaderBearerRegexpMatch[1];

      let jwtPayload: null | jwt.IJwtPayload = null;
      try {
        jwtPayload = await jwt.verify(bearerToken);
      } catch (e) {
        return callback(null, {
          body: JSON.stringify({
            error: "Invalid jwt token",
          }),
          headers: responseHeaders,
          statusCode: 401,
        });
      }
      const user = await models.User.findById(jwtPayload.user_id);
      if (!user) {
        throw new Error("Unexpected: User found in jwtPayload, but not in db");
      }

      raven.setContext({ user });

      graphQLContext.user = user;
    }

    const result = await graphql({
      contextValue: graphQLContext,
      schema,
      source: query.query,
      variableValues: query.variables,
    });

    return callback(null, {
      body: JSON.stringify(result),
      headers: responseHeaders,
      statusCode: 200,
    });
  } catch (e) {
    Raven.captureException(e);

    return callback(null, {
      body: { error: "Internal server error" },
      headers: {},
      statusCode: 500,
    });
  }
};

export const syncHandler = async (
  _: APIGatewayEvent,
  context: Context,
  callback: Callback,
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await sequelize.sync({ force: true });
  } catch (error) {
    return callback(error);
  }
  return callback();
};
