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
import { formatGraphQLErrors, InternalServerError } from "./errors";
import * as fixtures from "./fixtures";
import * as jwt from "./jwt";
import { sequelize } from "./models";
import * as models from "./models";
import schema from "./schema";

const authHeaderBearerRegexp = /Bearer (.*)/;

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

    if (event.headers && event.headers.Authorization) {
      const authHeaderBearerRegexpMatch = authHeaderBearerRegexp.exec(
        event.headers.Authorization,
      );

      if (!authHeaderBearerRegexpMatch) {
        return callback(null, {
          body: JSON.stringify({
            code: "INVALID_JWT_TOKEN",
            error: "Invalid authorization bearer format",
            expected: "Bearer (token)",
            got: event.headers.Authorization,
          }),
          headers: responseHeaders,
          statusCode: 400,
        });
      }

      const bearerToken = authHeaderBearerRegexpMatch[1];

      let accessTokenPayload: null | jwt.IAccessTokenPayload = null;
      try {
        accessTokenPayload = await jwt.verifyAccessToken(bearerToken);
      } catch (e) {
        return callback(null, {
          body: JSON.stringify({
            code: "INVALID_JWT_TOKEN",
            error: "Invalid jwt token",
          }),
          headers: responseHeaders,
          statusCode: 401,
        });
      }
      const user = await models.User.findById(accessTokenPayload.user_id);
      if (!user) {
        throw new InternalServerError("User not found", { accessTokenPayload });
      }

      raven.setContext({ user, accessTokenPayload });

      graphQLContext.user = user;
      graphQLContext.accessTokenPayload = accessTokenPayload;
    }

    const result = await graphql({
      contextValue: graphQLContext,
      operationName: query.operationName,
      schema,
      source: query.query,
      variableValues: query.variables,
    });

    return callback(null, {
      body: JSON.stringify({
        ...result,
        errors: result.errors && formatGraphQLErrors(result.errors, raven),
      }),
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
    await sequelize.query("create extension IF NOT EXISTS postgis");
    await sequelize.query("create extension IF NOT EXISTS fuzzystrmatch");
    await sequelize.query(
      "create extension IF NOT EXISTS postgis_tiger_geocoder",
    );
    await sequelize.query("create extension IF NOT EXISTS postgis_topology");

    await sequelize.query("alter schema tiger owner to rds_superuser");
    await sequelize.query("alter schema tiger_data owner to rds_superuser");
    await sequelize.query("alter schema topology owner to rds_superuser");
    await sequelize.query(
      "CREATE OR REPLACE FUNCTION exec(text) returns text language plpgsql volatile AS $f$ BEGIN EXECUTE $1; RETURN $1; END; $f$;",
    );
    await sequelize.query(`
      SELECT exec('ALTER TABLE ' || quote_ident(s.nspname) || '.' || quote_ident(s.relname) || ' OWNER TO rds_superuser;')
      FROM (
        SELECT nspname, relname
        FROM pg_class c JOIN pg_namespace n ON (c.relnamespace = n.oid) 
        WHERE nspname in ('tiger','topology') AND
        relkind IN ('r','S','v') ORDER BY relkind = 'S')
      s;
    `);
    await sequelize.sync({ force: true });
  } catch (error) {
    return callback(error);
  }
  return callback();
};

export const fixtureHandler = async (
  _: APIGatewayEvent,
  context: Context,
  callback: Callback,
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  await fixtures.generate(10);

  return callback();
};
