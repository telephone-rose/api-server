import { Polly } from "aws-sdk";
import * as config from "config";

const accessKeyId = config.get<string>("app.awsS3AccessKeyId");
const secretAccessKey = config.get<string>("app.awsS3SecretAccessKey");
const region = config.get<string>("app.awsS3Region");

const pollyClient = new Polly({ accessKeyId, secretAccessKey, region });

export const getVoices = async (LanguageCode: string = "en-US") => {
  const voices = await pollyClient
    .describeVoices({
      LanguageCode,
    })
    .promise();

  return voices.Voices!;
};

export const synthesize = async ({
  VoiceId,
  Text,
}: {
  VoiceId: string;
  Text: string;
}) => {
  const result = await pollyClient
    .synthesizeSpeech({
      OutputFormat: "ogg_vorbis",
      SampleRate: "22050",
      Text,
      VoiceId,
    })
    .promise();

  if (result.AudioStream instanceof Buffer) {
    return result.AudioStream;
  }

  throw new Error("Bad output type");
};
