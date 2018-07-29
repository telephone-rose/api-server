import * as config from "config";
import * as Sequelize from "sequelize";

import blockedUserDefinition from "./blocked-user";
import conversationDefinition from "./conversation";
import conversationUserDefinition from "./conversation-user";
import deviceDefinition from "./device";
import fileDefinition from "./file";
import hiddenUserDefinition from "./hidden-user";
import messageDefinition from "./message";
import recordingDefinition from "./recording";
import sessionDefinition from "./session";
import userDefinition from "./user";

const pgUri = config.has("app.pgUri")
  ? config.get<string>("app.pgUri")
  : `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${
      process.env.DB_HOST
    }/${process.env.DB_NAME}`;

export const sequelize = new Sequelize(pgUri, {
  dialect: "postgres",
});

export const Conversation = conversationDefinition(sequelize);
export const ConversationUser = conversationUserDefinition(sequelize);
export const Device = deviceDefinition(sequelize);
export const File = fileDefinition(sequelize);
export const Message = messageDefinition(sequelize);
export const Recording = recordingDefinition(sequelize);
export const Session = sessionDefinition(sequelize);
export const User = userDefinition(sequelize);
export const BlockedUser = blockedUserDefinition(sequelize);
export const HiddenUser = hiddenUserDefinition(sequelize);

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

Message.belongsTo(Recording, {
  foreignKey: "recordingId",
  targetKey: "id",
});

Recording.belongsTo(File, {
  foreignKey: "originalFileId",
  targetKey: "id",
});

Recording.belongsTo(File, {
  foreignKey: "compressedFileId",
  targetKey: "id",
});

Device.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
User.hasMany(Device, { foreignKey: "userId", sourceKey: "id" });

Session.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
User.hasMany(Session, { foreignKey: "userId", sourceKey: "id" });

User.belongsTo(Recording, {
  constraints: false,
  foreignKey: "answeringMessageRecordingId",
  targetKey: "id",
});

BlockedUser.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
});

BlockedUser.belongsTo(User, {
  foreignKey: "byUserId",
  targetKey: "id",
});

HiddenUser.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
});

HiddenUser.belongsTo(User, {
  foreignKey: "byUserId",
  targetKey: "id",
});
