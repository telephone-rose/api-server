import * as Sequelize from "sequelize";

interface IBlockedUserAttributes {
  userId: string;
  byUserId: string;
}

export interface IBlockedUserInstance
  extends Sequelize.Instance<IBlockedUserAttributes>,
    IBlockedUserAttributes {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<IBlockedUserInstance, IBlockedUserAttributes>(
    "BlockedUser",
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
