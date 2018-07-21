declare module "emojilib" {
  interface IEmoji {
    keywords: string[];
    char: string;
    fitzpatrick_scale: boolean;
    category: string;
  }

  export const lib: { [key: string]: IEmoji };
}
