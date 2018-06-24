import * as Sequelize from "sequelize";

export const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: "postgres",
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  username: process.env.DB_USERNAME,
});

interface IUserAttributes {
  email: string;
  facebookId: string;
  firstName: string;
  id?: string;
  lastName: string;
}

interface IUserInstance
  extends Sequelize.Instance<IUserAttributes>,
    IUserAttributes {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const User = sequelize.define<IUserInstance, IUserAttributes>(
  "User",
  {
    email: {
      allowNull: false,
      type: Sequelize.STRING,
      unique: true,
    },
    facebookId: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    firstName: {
      allowNull: false,
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
  },
  {
    indexes: [
      {
        fields: ["facebookId"],
      },
    ],
  },
);
