import { GraphQLEnumType } from "graphql";

export default new GraphQLEnumType({
  name: "DeviceType",
  values: { iOS: { value: "iOS" }, Android: { value: "Android" } },
});
