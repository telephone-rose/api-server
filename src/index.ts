import "source-map-support/register";

import * as Raven from "raven";
Raven.config(
  "https://5d9acd9db1fd436db9944f2838e2a993:6ed28463172f48c0b3aaf2c007c9bf34@sentry.telephone-ro.se/3",
  { autoBreadcrumbs: true, captureUnhandledRejections: true },
).install();

import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { graphql } from "graphql";

import { sequelize } from "./models";
import schema from "./schema";

export const graphqlHandler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback,
) => {
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

  const result = await graphql({
    schema,
    source: query.query,
    variableValues: query.variables,
  });

  return callback(null, {
    body: JSON.stringify(result),
    headers: responseHeaders,
    statusCode: 200,
  });
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
