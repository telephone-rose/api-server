import * as config from "config";
import { OAuth2Client } from "google-auth-library";
import { ClientError } from "./errors";

const googleClientId = config.get<string>("app.googleClientId");
const googleClientSecret = config.get<string>("app.googleClientSecret");
const client = new OAuth2Client({
  clientId: googleClientId,
  clientSecret: googleClientSecret,
});

export const verify = async (token: string) => {
  const ticket = await client.verifyIdToken({
    audience: googleClientId,
    idToken: token,
  });
  if (!ticket) {
    throw new ClientError("GOOGLE_AUHT_ERROR_CANNOT_VERIFY_ID_TOKEN");
  }
  const payload = ticket.getPayload();
  if (!payload) {
    throw new ClientError("GOOGLE_AUHT_ERROR_CANNOT_GET_TOKEN_PAYLOAD");
  }
  if (
    !payload.email ||
    !payload.email_verified ||
    !payload.family_name ||
    !payload.given_name
  ) {
    throw new ClientError("GOOGLE_AUTH_ERROR_INSUFFICIENT_TOKEN_PERMISSIONS", {
      got: { payload },
    });
  }

  return {
    email: payload.email,
    firstName: payload.given_name,
    id: payload.sub,
    lastName: payload.family_name,
  };
};
