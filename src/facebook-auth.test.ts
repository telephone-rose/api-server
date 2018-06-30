import * as assert from "assert";

import * as facebookAuth from "./facebook-auth";

import * as testUtils from "./__test__/utils";
import { ClientError } from "./errors";

describe("Facebook auth", () => {
  it("LOCAL: should fail to sign in if the provided token is invalid", async () => {
    const result = await facebookAuth.verify("toto").catch(e => e);

    assert(result instanceof ClientError);
    assert(result.code === "FACEBOOK_AUTH_ERROR_CANNOT_VERIFY_ID_TOKEN");
  });

  it("LOCAL: should fail to sign in if the provided token is valid but the token permissions insufficient", async () => {
    const testUser = await testUtils.generateFacebookTestUser();

    const result = await facebookAuth
      .verify(testUser.access_token)
      .catch(e => e);

    assert(result instanceof ClientError);
    assert(
      result.code === "FACEBOOK_AUTH_ERROR_INSUFFICIENT_TOKEN_PERMISSIONS",
    );
  }).timeout(10000);

  it("LOCAL: should succeed to sign in if the provided token is valid and the permissions sufficient", async () => {
    const testUser = await testUtils.generateFacebookTestUser({
      permissions: ["email"],
    });

    const result = await facebookAuth.verify(testUser.access_token);

    assert(typeof result.id === "string");
    assert(typeof result.email === "string");
    assert(typeof result.firstName === "string");
    assert(typeof result.lastName === "string");
  }).timeout(10000);
});
