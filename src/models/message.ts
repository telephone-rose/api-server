import * as Sequelize from "sequelize";

interface IMessageAttributes {
  conversationId: string;
  recordingFileId: string;
  senderId: string;
  recipientId: string;
  text?: string | null;
}

export interface IMessageInstance
  extends Sequelize.Instance<IMessageAttributes>,
    IMessageAttributes {
  readonly id: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  text: string | null;
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
      text: {
        allowNull: true,
        comment: "Only for debugging purpose",
        type: Sequelize.STRING,
      },
    },
    {
      indexes: [
        { fields: ["senderId"] },
        { fields: ["conversationId"] },
        { fields: ["createdAt"] },
      ],
    },
  );
