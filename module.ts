import { DynamicModule, Module, OnApplicationShutdown } from "@nestjs/common";
import type { MongoMemoryServer } from "mongodb-memory-server-core";
import type { MongoMemoryServerOpts } from "mongodb-memory-server-core/lib/MongoMemoryServer";

import { getEnv } from "../../utils";

export type MongoMemoryServerModuleOptions = MongoMemoryServerOpts & {
  databaseName?: string;
};

@Module({})
export class MongoMemoryServerModule implements OnApplicationShutdown {
  constructor(private readonly mongod: MongoMemoryServer) {}

  static forRoot(options?: MongoMemoryServerModuleOptions): DynamicModule {
    let mongod: MongoMemoryServer;
    const { MongooseModule } = require("@nestjs/mongoose");
    const { MongoMemoryServer } = require("mongodb-memory-server-core");

    const config: MongoMemoryServerModuleOptions = {
      binary: {
        systemBinary: getEnv("MONGOD_PATH"),
      },
      ...options,
    };

    return MongooseModule.forRootAsync({
      useFactory: async () => {
        mongod = await MongoMemoryServer.create(config);

        return {
          uri: mongod.getUri() + config?.databaseName,
        };
      },
    });
  }

  async onApplicationShutdown() {
    await this.mongod.stop();
  }
}
