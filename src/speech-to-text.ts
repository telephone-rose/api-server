import axios from "axios";
import * as config from "config";

const googleCloudPlatformAPIKey = config.get("app.googleCloudPlatformAPIKey");

export const recognize = async (content: Buffer, languageCode = "en-US") => {
  const result = await axios.post<{
    results: Array<{
      alternatives: Array<{
        transcript: string;
        confidence: number;
        words: Array<{
          startTime: string;
          endTime: string;
          word: string;
        }>;
      }>;
    }>;
  }>(
    `https://speech.googleapis.com/v1/speech:recognize?key=${googleCloudPlatformAPIKey}`,
    {
      audio: { content: content.toString("base64") },
      config: {
        enableWordTimeOffsets: true,
        languageCode,
      },
    },
  );

  return result.data.results[0].alternatives[0];
};
