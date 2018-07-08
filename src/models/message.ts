import * as Sequelize from "sequelize";

interface IMessageAttributes {
  id?: number;
  conversationId: string;
  recordingId: string;
  senderId: string;
  text?: string | null;
}

export interface IMessageInstance
  extends Sequelize.Instance<IMessageAttributes>,
    IMessageAttributes {
  id: number;
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
      recordingId: {
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
        { fields: [{ attribute: "createdAt", order: "DESC" } as any] },
      ],
    },
  );
