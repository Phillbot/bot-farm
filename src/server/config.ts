type ServerConfigType = {
  port: number;
};

const defaultPort = 8080;

class ServerConfig {
  private readonly _PORT: number;

  constructor() {
    this._PORT = process.env.SERVER_PORT
      ? Number(process.env.SERVER_PORT)
      : defaultPort;
  }

  get config(): ServerConfigType {
    return {
      port: this._PORT,
    };
  }
}

export const serverConfig = new ServerConfig().config;
