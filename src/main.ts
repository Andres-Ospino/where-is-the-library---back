import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { Logger } from "nestjs-pino"
import { AppModule } from "./app.module"
import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

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

  // Swagger documentation at root path
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Library Management API")
    .setDescription("API documentation for the library management system")
    .setVersion("1.0.0")
    .build()
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup("/", app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  })

  // CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
  })

  const host = "0.0.0.0"
  const port = Number.parseInt(process.env.PORT ?? "8080", 10) || 8080

  await app.listen(port, host)

  console.log(`Application is running on: http://${host}:${port}`)
}

bootstrap()
