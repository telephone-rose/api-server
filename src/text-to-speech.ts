import { Polly } from "aws-sdk";
import * as config from "config";

const accessKeyId = config.get<string>("app.awsS3AccessKeyId");
const secretAccessKey = config.get<string>("app.awsS3SecretAccessKey");
const region = config.get<string>("app.awsS3Region");

const pollyClient = new Polly({ accessKeyId, secretAccessKey, region });

export const getVoices = async () => {
  const voices = await pollyClient.describeVoices().promise();

  return voices.Voices!.map(voice => voice.Id!);
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
      OutputFormat: "mp3",
      SampleRate: "16000",
      Text,
      VoiceId,
    })
    .promise();

  if (result.AudioStream instanceof Buffer) {
    return result.AudioStream;
  }

  throw new Error("Bad output type");
};
