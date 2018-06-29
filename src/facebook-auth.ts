import axios from "axios";
import * as config from "config";
import * as crypto from "crypto";

import { ClientError } from "./errors";

const facebookAppSecret = config.get<string>("app.facebookAppSecret");

export const verify = async (token: string) => {
  const hash = crypto
    .createHmac("sha256", facebookAppSecret)
    .update(token)
    .digest("hex");

  const meResult = await axios.get(
    `https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token=${token}&appsecret_proof=${hash}`,
  );

  if (meResult.status !== 200) {
    throw new ClientError("FACEBOOK_AUTH_ERROR_CANNOT_VERIFY_ID_TOKEN");
  }

  if (
    !meResult.data.email ||
    !meResult.data.first_name ||
    !meResult.data.id ||
    !meResult.data.last_name
  ) {
    throw new ClientError("FACEBOOK_AUTH_ERROR_INSUFFICIENT_TOKEN_PERMISSIONS");
  }

  return {
    email: meResult.data.email,
    firstName: meResult.data.first_name,
    id: meResult.data.id,
    lastName: meResult.data.last_name,
  };
};
