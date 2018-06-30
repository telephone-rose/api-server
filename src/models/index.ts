import * as config from "config";
import * as Sequelize from "sequelize";
import logger from "../logger";

import conversationDefinition from "./conversation";
import conversationUserDefinition from "./conversation-user";
import deviceDefinition from "./device";
import fileDefinition from "./file";
import messageDefinition from "./message";
import sessionDefinition from "./session";
import userDefinition from "./user";

const pgUri = config.has("app.pgUri")
  ? config.get<string>("app.pgUri")
  : `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${
      process.env.DB_HOST
    }/${process.env.DB_NAME}`;

logger.info("PG", { hasPg: config.has("app.pgUri"), pgUri });

export const sequelize = new Sequelize(pgUri, {
  dialect: "postgres",
});

export const Conversation = conversationDefinition(sequelize);
export const ConversationUser = conversationUserDefinition(sequelize);
export const Device = deviceDefinition(sequelize);
export const File = fileDefinition(sequelize);
export const Message = messageDefinition(sequelize);
export const User = userDefinition(sequelize);
export const Session = sessionDefinition(sequelize);

ConversationUser.belongsTo(Conversation, {
  foreignKey: "conversationId",
  targetKey: "id",
});
Conversation.hasMany(ConversationUser, {
  foreignKey: "conversationId",
  sourceKey: "id",
});

ConversationUser.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
User.hasMany(ConversationUser, {
  foreignKey: "userId",
  sourceKey: "id",
});

File.belongsTo(User, {
  foreignKey: "creatorId",
  targetKey: "id",
});
User.hasMany(File, {
  foreignKey: "creatorId",
  sourceKey: "id",
});

Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  targetKey: "id",
});
Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  sourceKey: "id",
});

Message.belongsTo(User, {
  foreignKey: "senderId",
  targetKey: "id",
});
User.hasMany(Message, {
  foreignKey: "senderId",
  sourceKey: "id",
});

Message.belongsTo(File, {
  foreignKey: "recordingFileId",
  targetKey: "id",
});
File.hasMany(Message, {
  foreignKey: "recordingFileId",
  sourceKey: "id",
});

Device.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
User.hasMany(Device, { foreignKey: "userId", sourceKey: "id" });

Session.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
User.hasMany(Session, { foreignKey: "userId", sourceKey: "id" });
