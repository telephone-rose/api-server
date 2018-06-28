import * as winston from "winston";

export default winston.createLogger({
  format: winston.format.json(),
  level: "info",
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
