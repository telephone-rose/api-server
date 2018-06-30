import * as Sequelize from "sequelize";

interface IFileAttributes {
  contentLength: number;
  contentType: string;
  creatorId: string;
  id?: string;
}

export interface IFileInstance
  extends Sequelize.Instance<IFileAttributes>,
    IFileAttributes {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<IFileInstance, IFileAttributes>(
    "File",
    {
      contentLength: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      contentType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      creatorId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
    },
    {
      indexes: [],
    },
  );
