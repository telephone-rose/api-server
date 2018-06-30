import * as models from "./";

describe("Models", () => {
  it("should force the db flush", () => {
    return models.sequelize.sync({ force: true });
  });
});
