<<<<<<< HEAD
import { join } from "node:path"

=======
import "reflect-metadata"
import { NestFactory } from "@nestjs/core"
>>>>>>> origin/codex/remove-prisma-ldugxq
import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { NestExpressApplication } from "@nestjs/platform-express"
import type { Request, Response } from "express"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import * as OpenApiToPostman from "openapi-to-postmanv2"
import { Logger } from "nestjs-pino"

import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  })

  app.useStaticAssets(join(process.cwd(), "public"), {
    prefix: "/swagger-static/",
  })

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
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    })
    .build()
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

  const httpServer = app.getHttpAdapter().getInstance()
  httpServer.get("/postman-collection", (_req: Request, res: Response) => {
    OpenApiToPostman.convert(
      { type: "json", data: swaggerDocument },
      { folderStrategy: "Tags" },
      (error, conversion) => {
        if (error || !conversion?.result) {
          logger.error(
            `No se pudo convertir el documento OpenAPI a Postman: ${
              error?.message ?? conversion?.reason ?? "resultado inválido"
            }`,
          )
          res.status(500).json({ message: "No se pudo generar la colección de Postman." })
          return
        }

        const postmanCollection = conversion.output?.[0]?.data

        if (!postmanCollection) {
          logger.error("La conversión de OpenAPI a Postman no devolvió datos.")
          res.status(500).json({ message: "No se pudo generar la colección de Postman." })
          return
        }

        res.header("Content-Type", "application/json; charset=utf-8")
        res.header(
          "Content-Disposition",
          'attachment; filename="library-management.postman_collection.json"',
        )
        res.send(JSON.stringify(postmanCollection, null, 2))
      },
    )
  })

  SwaggerModule.setup("/", app, swaggerDocument, {
    customCss: `
      #download-postman-button {
        margin-left: 1rem;
        background-color: #2563eb;
        border: none;
        border-radius: 4px;
        color: #fff;
        cursor: pointer;
        font-weight: 600;
        padding: 0.5rem 1rem;
      }

      #download-postman-button:hover {
        background-color: #1d4ed8;
      }
    `,
    customJs: ["/swagger-static/swagger-custom.js"],
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
