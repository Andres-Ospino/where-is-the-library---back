import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { LoggerModule } from "nestjs-pino"
import { CoreModule } from "@/core/core.module"
import { CatalogModule } from "@/modules/catalog/catalog.module"
import { MembersModule } from "@/modules/members/members.module"
import { LoansModule } from "@/modules/loans/loans.module"
import { HealthModule } from "./health/health.module"
import { AuthModule } from "@/modules/auth/auth.module"
import { ensureCloudSqlEnv, loadCloudSqlConfig } from "@/config/cloudsql.config"

ensureCloudSqlEnv()

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [loadCloudSqlConfig],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: "pino-pretty",
          options: {
            singleLine: true,
          },
        },
      },
    }),
    CoreModule,
    AuthModule,
    CatalogModule,
    MembersModule,
    LoansModule,
    HealthModule,
  ],
})
export class AppModule {}
