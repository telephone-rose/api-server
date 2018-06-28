import * as config from "config";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import * as path from "path";

const jwtAccessTokenSigninAlgorithm = config.get<string>(
  "app.jwtAccessTokenAlgorithm",
);
const jwtRefreshTokenSigninAlgorithm = config.get<string>(
  "app.jwtRefreshTokenAlgorithm",
);
const jwtAccessTokenExpiration = config.get<string>("app.jwtAccessTokenTtl");
const jwtRefreshTokenExpiration = config.get<string>("app.jwtRefreshTokenTtl");
const jwtAccessTokenSigninKey = jwtAccessTokenSigninAlgorithm.startsWith("RS")
  ? fs.readFileSync(path.join(__dirname, "jwt-access-token-key"))
  : config.get<string>("app.jwtAccessTokenKey");
export const jwtAccessTokenPublicKey = jwtAccessTokenSigninAlgorithm.startsWith(
  "RS",
)
  ? fs.readFileSync(path.join(__dirname, "jwt-access-token-key.pub"))
  : config.get<string>("app.jwtAccessTokenKey");
const jwtRefreshTokenSigninKey = jwtRefreshTokenSigninAlgorithm.startsWith("RS")
  ? fs.readFileSync(path.join(__dirname, "jwt-refresh-token-key"))
  : config.get<string>("app.jwtRefreshTokenKey");
export const jwtRefreshTokenPublicKey = jwtRefreshTokenSigninAlgorithm.startsWith(
  "RS",
)
  ? fs.readFileSync(path.join(__dirname, "jwt-refresh-token-key.pub"))
  : config.get<string>("app.jwtRefreshTokenKey");

export interface IAccessTokenPayload {
  user_id: string;
  session_id: string;
}

export interface IRefreshTokenPayload {
  session_id: string;
}

const isAValidAccessTokenPayload = (x: any): x is IAccessTokenPayload =>
  x && typeof x.user_id === "string" && typeof x.session_id === "string";

const isAStrictlyValidAccessTokenPayload = (x: any): x is IAccessTokenPayload =>
  isAValidAccessTokenPayload(x) && Object.keys(x).length === 2;

const isAValidRefreshTokenPayload = (x: any): x is IRefreshTokenPayload =>
  x && typeof x.session_id === "string";

const isAStrictlyValidRefreshTokenPayload = (
  x: any,
): x is IRefreshTokenPayload =>
  isAValidRefreshTokenPayload(x) && Object.keys(x).length === 1;

const sign = (
  payload: any,
  algorithm: string,
  signinKey: string | Buffer,
  expiresIn: string,
) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      payload,
      signinKey,
      {
        algorithm,
        expiresIn,
      },
      (err, token) => {
        if (err) {
          return reject(err);
        }
        return resolve(token);
      },
    );
  });
};

export const signAccessToken = (payload: IAccessTokenPayload) => {
  if (!isAStrictlyValidAccessTokenPayload(payload)) {
    throw new Error(
      `Unexpected, cannot encode this JWT access token, not a valid payload, ${JSON.stringify(
        payload,
      )}`,
    );
  }

  return sign(
    payload,
    jwtAccessTokenSigninAlgorithm,
    jwtAccessTokenSigninKey,
    jwtAccessTokenExpiration,
  );
};

export const signRefreshToken = (payload: IRefreshTokenPayload) => {
  if (!isAStrictlyValidRefreshTokenPayload(payload)) {
    throw new Error(
      "Unexpected, cannot encode this JWT refresh token token, not a valid payload",
    );
  }

  return sign(
    payload,
    jwtRefreshTokenSigninAlgorithm,
    jwtRefreshTokenSigninKey,
    jwtRefreshTokenExpiration,
  );
};

const verify = (token: string, key: Buffer | string, algorithm: string) =>
  new Promise<any>((resolve, reject) => {
    jwt.verify(token, key, { algorithms: [algorithm] }, (err, payload) => {
      if (err) {
        return reject(err);
      }
      return resolve(payload);
    });
  });

export const verifyAccessToken = async (token: string) => {
  const payload = await verify(
    token,
    jwtAccessTokenPublicKey,
    jwtAccessTokenSigninAlgorithm,
  );
  if (!isAValidAccessTokenPayload(payload)) {
    throw new Error("Not a valid access token");
  }

  return payload;
};

export const verifyRefreshToken = async (token: string) => {
  const payload = await verify(
    token,
    jwtRefreshTokenPublicKey,
    jwtRefreshTokenSigninAlgorithm,
  );
  if (!isAValidRefreshTokenPayload(payload)) {
    throw new Error("Not a valid refresh token");
  }

  return payload;
};
