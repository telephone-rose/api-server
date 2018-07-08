declare module "ffmpeg-static" {
  interface IModule {
    path: string;
  }

  const module: IModule;

  export = module;
}
