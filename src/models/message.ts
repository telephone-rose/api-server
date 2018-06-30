import * as Sequelize from "sequelize";

interface IMessageAttributes {
  conversationId: string;
  recipientId: string;
  recordingFileId: string;
  senderId: string;
}

export interface IMessageInstance
  extends Sequelize.Instance<IMessageAttributes>,
    IMessageAttributes {
  readonly id: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<IMessageInstance, IMessageAttributes>(
    "Message",
    {
      conversationId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      recipientId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      recordingFileId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      senderId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
    },
    {
      indexes: [
        { fields: ["senderId"] },
        { fields: ["recipientId"] },
        { fields: ["conversationId"] },
      ],
    },
  );
