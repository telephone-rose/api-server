import * as Sequelize from "sequelize";

interface ISessionAttributes {
  id?: string;
  userId: string;
  revokedAt: Date | null;
}

export interface ISessionInstance
  extends Sequelize.Instance<ISessionAttributes>,
    ISessionAttributes {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<ISessionInstance, ISessionAttributes>(
    "Session",
    {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      revokedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
    },
    {
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    },
  );
