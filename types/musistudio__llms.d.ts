declare module '@musistudio/llms' {
  interface FastifyApp {
    get(path: string, handler: (req?: any, reply?: any) => Promise<any>): void;
    post(path: string, handler: (req?: any, reply?: any) => Promise<any>): void;
    register(plugin: any, options?: any): void;
    _server?: {
      transformerService?: {
        getAllTransformers(): Map<string, any>;
      };
    };
  }

  class Server {
    app: FastifyApp;
    constructor(config: any);
  }

  export default Server;
}