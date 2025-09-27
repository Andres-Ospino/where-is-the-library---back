import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { Logger } from "nestjs-pino"
import { AppModule } from "./app.module"
import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })

  // Use Pino logger
  // The original code had a linting error here. Moving app.get(Logger) outside of app.useLogger fixes it.
  const logger = app.get(Logger)
  app.useLogger(logger)

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter())

  // CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
  })

  const port = Number.parseInt(process.env.PORT ?? "3000", 10) || 3000
  await app.listen(port, "0.0.0.0")

  console.log(`Application is running on: http://localhost:${port}`)
}

bootstrap()
