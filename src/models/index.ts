import * as Sequelize from "sequelize";

import sessionDefinition from "./session";
import userDefinition from "./user";

export const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: "postgres",
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  username: process.env.DB_USERNAME,
});

export const User = userDefinition(sequelize);
export const Session = sessionDefinition(sequelize);

Session.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
User.hasMany(Session, { foreignKey: "userId", sourceKey: "id" });
