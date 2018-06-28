import * as Sequelize from "sequelize";

interface IUserAttributes {
  email: string;
  facebookId: string | null;
  googleId: string | null;
  firstName: string;
  id?: string;
  lastName: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  } | null;
}

export interface IUserInstance
  extends Sequelize.Instance<IUserAttributes>,
    IUserAttributes {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<IUserInstance, IUserAttributes>(
    "User",
    {
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      facebookId: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      firstName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      googleId: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      lastName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      location: {
        allowNull: true,
        type: Sequelize.GEOMETRY("Point"),
      },
    },
    {
      indexes: [
        {
          fields: ["facebookId"],
        },
        {
          fields: ["googleId"],
        },
      ],
    },
  );
