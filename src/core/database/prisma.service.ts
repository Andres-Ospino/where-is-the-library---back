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
  private static readonly MAX_RETRY_ATTEMPTS = 5
  private static readonly RETRY_DELAY_MS = 2_000

  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL no está definida. Configura la variable de entorno antes de iniciar PrismaService.",
      )
    }

    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }

  async onModuleInit() {
    await this.connectWithRetry(
      PrismaService.MAX_RETRY_ATTEMPTS,
      PrismaService.RETRY_DELAY_MS,
    )
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
