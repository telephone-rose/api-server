import * as config from "config";
import { OAuth2Client } from "google-auth-library";

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
    throw new Error("Google auth error, cannot verifyIdToken");
  }
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Google auth error, cannot get payload");
  }
  if (
    !payload.email ||
    !payload.email_verified ||
    !payload.family_name ||
    !payload.given_name
  ) {
    throw new Error("Google auth, insufficient permissions");
  }

  return {
    email: payload.email,
    firstName: payload.given_name,
    id: payload.sub,
    lastName: payload.family_name,
  };
};
