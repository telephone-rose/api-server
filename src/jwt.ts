import * as config from "config";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import * as path from "path";

const jwtSigninAlgorithm = config.get<string>("app.jwtAlgorithm");
const jwtExpiration = config.get<number>("app.jwtTtl");
const jwtSigninKey = jwtSigninAlgorithm.startsWith("RS")
  ? fs.readFileSync(path.join(__dirname, "jwt-key"))
  : config.get<string>("app.jwtKey");
const jwtPublicKey = jwtSigninAlgorithm.startsWith("RS")
  ? fs.readFileSync(path.join(__dirname, "jwt-key.pub"))
  : config.get<string>("app.jwtKey");

export interface IJwtPayload {
  user_id: string;
  session_id: string;
}

const isAValidPayload = (x: any): x is IJwtPayload =>
  x && typeof x.user_id === "string" && typeof x.session_id === "string";

export const sign = (payload: any) => {
  if (!isAValidPayload(payload)) {
    throw new Error(
      "Unexpected, cannot encore this JWT token, not a valid payload",
    );
  }
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      payload,
      jwtSigninKey,
      {
        algorithm: jwtSigninAlgorithm,
        expiresIn: jwtExpiration,
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

export const verify = (token: string) =>
  new Promise<IJwtPayload>((resolve, reject) => {
    jwt.verify(token, jwtPublicKey, {}, (err, payload) => {
      if (err) {
        return reject(err);
      }
      if (!isAValidPayload(payload)) {
        return reject(
          new Error(
            `Unexpected: JWT Token decoded, but do not contains a valid payload`,
          ),
        );
      }
      return resolve(payload);
    });
  });
