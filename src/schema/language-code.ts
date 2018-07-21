import { GraphQLEnumType } from "graphql";

export type TLanguageCode = "en-US" | "es-ES" | "fr-FR";

const languages: TLanguageCode[] = ["en-US", "es-ES", "fr-FR"];

export default new GraphQLEnumType({
  name: "language",
  values: languages.reduce(
    (acc: { [key: string]: { value: TLanguageCode } }, language) => ({
      ...acc,
      [language.replace(/-/, "")]: { value: language },
    }),
    {},
  ),
});
