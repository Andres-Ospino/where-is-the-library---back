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
  private readonly databaseUrl?: string

  constructor() {
    const databaseUrl = process.env.DATABASE_URL

    super(
      databaseUrl
        ? {
            datasources: {
              db: {
                url: databaseUrl,
              },
            },
          }
        : undefined,
    )

    this.databaseUrl = databaseUrl

    if (!databaseUrl) {
      this.logger.warn(
        "DATABASE_URL no está definido. La aplicación se iniciará sin conexión a base de datos y las operaciones que dependan de ella fallarán hasta que la variable esté configurada.",
      )
    }
  }

  async onModuleInit() {
    if (!this.databaseUrl) {
      this.logger.warn(
        "Omitiendo la conexión inicial a la base de datos porque DATABASE_URL no está configurado.",
      )
      return
    }

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
