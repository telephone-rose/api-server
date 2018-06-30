import * as Sequelize from "sequelize";

interface IDeviceAttributes {
  token: string;
  type: string;
  userId: string;
}

export interface IDeviceInstance
  extends Sequelize.Instance<IDeviceAttributes>,
    IDeviceAttributes {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<IDeviceInstance, IDeviceAttributes>(
    "Device",
    {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      token: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
    },
    {
      indexes: [{ fields: ["userId"] }, { fields: ["token"] }],
    },
  );
