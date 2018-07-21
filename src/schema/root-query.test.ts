import * as assert from "assert";

import { testGraphQLHandler } from "../__test__/utils";

describe("Root query", () => {
  it("Should test the root query handler", async () => {
    const result = await testGraphQLHandler(`
      query users {
        randomUserFeed (
          pagination: {
            limit: 10,
            offset: 0
          }
        ) {
          id
        }
      }
    `);

    assert(Array.isArray(result.data.randomUserFeed));
  });
});
