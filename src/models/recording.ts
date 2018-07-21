import * as Sequelize from "sequelize";

interface IRecordingAttributes {
  id?: string;
  creatorId: string;
  compressedFileId: string;
  languageCode: string;
  originalFileId: string;
  transcript: string;
  transcriptConfidence: number;
  transcriptWords: Array<{
    startTime: string;
    endTime: string;
    word: string;
  }>;
}

export interface IRecordingInstance
  extends Sequelize.Instance<IRecordingAttributes>,
    IRecordingAttributes {
  id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<IRecordingInstance, IRecordingAttributes>(
    "Recording",
    {
      compressedFileId: {
        allowNull: false,
        type: Sequelize.UUID,
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
      languageCode: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      originalFileId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      transcript: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      transcriptConfidence: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      transcriptWords: {
        allowNull: false,
        type: Sequelize.JSONB,
      },
    },
    {
      indexes: [{ fields: ["creatorId"] }],
    },
  );
