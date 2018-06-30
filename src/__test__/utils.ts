import axios from "axios";
import * as config from "config";

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
