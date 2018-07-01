import { GraphQLEnumType } from "graphql";

export type TDeviceTypeOutput = "iOS" | "Android";

export default new GraphQLEnumType({
  name: "DeviceType",
  values: { iOS: { value: "iOS" }, Android: { value: "Android" } },
});
