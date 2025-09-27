import {
  Injectable,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from "@nestjs/common"
import { PrismaClient } from "@prisma/client"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log("Conexión inicial a la base de datos establecida correctamente")
    } catch (error) {
      this.logger.error(
        "No se pudo establecer la conexión inicial a la base de datos. Las operaciones seguirán fallando hasta que la conexión se restablezca.",
        error instanceof Error ? error.stack : undefined,
      )
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
