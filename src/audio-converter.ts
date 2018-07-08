import * as childProcess from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const ffmpegPath = path.join(__dirname, "..", `ffmpeg.${os.platform()}`);

import logger from "./logger";

export const run = (
  input: Buffer,
  outputFormatExt: "opus" | "flac" | "mp3",
) => {
  return new Promise<Buffer>((resolve, reject) => {
    let error: string | null = null;

    const tmpDir = os.tmpdir();
    fs.mkdtemp(`${tmpDir}${path.sep}`, (err, folder) => {
      if (err) {
        return reject(err);
      }
      const inputFilePath = path.join(folder, `input`);
      const outputFilePath = path.join(folder, `output.${outputFormatExt}`);

      fs.writeFile(inputFilePath, input, writeInputErr => {
        if (writeInputErr) {
          return reject(writeInputErr);
        }
        const process = childProcess.spawn(ffmpegPath, [
          "-i",
          inputFilePath,
          outputFilePath,
        ]);

        process.stdout.on("data", chunk => {
          logger.info("FFMpeg", chunk.toString());
        });

        process.stderr.on("data", chunk => {
          error += chunk.toString();
        });

        process.on("close", code => {
          if (code !== 0) {
            return reject(new Error(error || "Audio converter error"));
          }
          fs.readFile(outputFilePath, (readError, result) => {
            if (readError) {
              return reject(readError);
            }

            return resolve(result);
          });
        });
      });
    });
  });
};
