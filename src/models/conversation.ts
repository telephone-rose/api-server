import * as Sequelize from "sequelize";

interface IConversationAttributes {
  id?: string;
  latestActivityAt: Date;
}

export interface IConversationInstance
  extends Sequelize.Instance<IConversationAttributes>,
    IConversationAttributes {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<IConversationInstance, IConversationAttributes>(
    "Conversation",
    {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      latestActivityAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    },
    {
      indexes: [
        { fields: [{ attribute: "latestActivityAt", order: "DESC" } as any] },
      ],
    },
  );
