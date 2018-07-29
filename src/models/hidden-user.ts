import * as Sequelize from "sequelize";

interface IHiddenUserAttributes {
  userId: string;
  byUserId: string;
}

export interface IHiddenUserInstance
  extends Sequelize.Instance<IHiddenUserAttributes>,
    IHiddenUserAttributes {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<IHiddenUserInstance, IHiddenUserAttributes>(
    "HiddenUser",
    {
      byUserId: {
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
      indexes: [],
    },
  );
