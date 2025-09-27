import {
  Injectable,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from "@nestjs/common"
import { PrismaClient } from "@prisma/client"

@Injectable()
/**
 * Servicio responsable de extender {@link PrismaClient}, validar la presencia de
 * `DATABASE_URL` y preparar la conexión a la base de datos utilizada por la aplicación.
 */
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

    this.logger.warn(
      "Iniciando la conexión a la base de datos en background. La aplicación continuará levantando sin esperar a que se complete el intento inicial.",
    )

    void this.$connect()
      .then(() => {
        this.logger.log("Conexión inicial a la base de datos establecida correctamente")
      })
      .catch((error) => {
        this.logger.error(
          "No se pudo establecer la conexión inicial a la base de datos. Las operaciones seguirán fallando hasta que la conexión se restablezca.",
          error instanceof Error ? error.stack : undefined,
        )
      })
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  private async connectWithRetry(maxAttempts: number, retryDelayMs: number) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.log(
          `Intentando conectar con la base de datos (intento ${attempt} de ${maxAttempts}).`,
        )
        await this.$connect()
        this.logger.log("Conexión a la base de datos establecida correctamente.")
        return
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined

        this.logger.error(
          `Fallo en el intento ${attempt} de conexión a la base de datos: ${errorMessage}`,
          errorStack,
        )

        if (attempt === maxAttempts) {
          throw error
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
      }
    }
  }
}
