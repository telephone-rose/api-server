import * as Sequelize from "sequelize";

interface IConversationAttributes {
  conversationId: string;
  userId: string;
}

export interface IConversationInstance
  extends Sequelize.Instance<IConversationAttributes>,
    IConversationAttributes {}

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<IConversationInstance, IConversationAttributes>(
    "ConversationUser",
    {
      conversationId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      userId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
    },
    {
      indexes: [{ fields: ["conversationId"] }, { fields: ["userId"] }],
      timestamps: false,
    },
  );
