import * as dotenv from 'dotenv';
import flatten from 'flat';
import { InternalServerErrorException } from '@nestjs/common';

dotenv.config();

class ConfigService {
  public static readonly serviceName = 'speer-test';

  public readonly appEnv: string | undefined = process.env.APP_ENV;

  private readonly envConfig: { [key: string]: any };

  constructor() {
    try {
      // eslint-disable-next-line
      const configObject = require(`./envs/${this.appEnv}`);
      this.envConfig = flatten(configObject);
    } catch (err) {
      throw new InternalServerErrorException(
        `Unable to load config for environment: ${this.appEnv}`,
      );
    }
  }

  get(key: string): any {
    return this.envConfig[key];
  }
}

export { ConfigService };
