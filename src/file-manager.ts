import { S3 } from "aws-sdk";
import * as config from "config";

const accessKeyId = config.get<string>("app.awsS3AccessKeyId");
const secretAccessKey = config.get<string>("app.awsS3SecretAccessKey");
const region = config.get<string>("app.awsS3Region");
const Bucket = config.get<string>("app.awsS3UploadBucket");

const s3 = new S3({ accessKeyId, secretAccessKey, region });

export const signPutObject = ({
  Expires,
  Key,
  ContentType,
}: {
  Key: string;
  Expires: number;
  ContentType: string;
}) =>
  s3.getSignedUrl("putObject", {
    Bucket,
    ContentType,
    Expires,
    Key,
  });

export const signGetObject = ({
  Expires,
  Key,
}: {
  Key: string;
  Expires: number;
}) =>
  s3.getSignedUrl("getObject", {
    Bucket,
    Expires,
    Key,
  });

export const headObject = async ({
  Key,
}: {
  Key: string;
}): Promise<S3.HeadObjectOutput> =>
  new Promise<S3.HeadObjectOutput>((resolve, reject) =>
    s3.headObject({ Key, Bucket }, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    }),
  );
