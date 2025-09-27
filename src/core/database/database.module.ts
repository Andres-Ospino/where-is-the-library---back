import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule, type TypeOrmModuleOptions } from "@nestjs/typeorm"
import { BookOrmEntity } from "@/modules/catalog/infrastructure/persistence/typeorm/book.orm-entity"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"
import { LoanOrmEntity } from "@/modules/loans/infrastructure/persistence/typeorm/loan.orm-entity"
import { cloudSqlDefaults } from "@/config/cloudsql.config"

function buildTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
  const nodeEnv = configService.get<string>("NODE_ENV")
  const entities = [BookOrmEntity, MemberOrmEntity, LoanOrmEntity]

  if (nodeEnv === "test") {
    return {
      type: "sqlite",
      database: ":memory:",
      entities,
      synchronize: true,
      dropSchema: true,
    }
  }

  const databaseUrl = configService.get<string>("DATABASE_URL") ?? cloudSqlDefaults.database.url
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be defined to initialize the database connection")
  }

  const [_, rawQuery] = databaseUrl.split("?")
  const searchParams = rawQuery ? new URLSearchParams(rawQuery) : undefined
  const cloudSqlHost = searchParams?.get("host") ?? undefined
  const sslMode = searchParams?.get("sslmode") ?? configService.get<string>("DB_SSLMODE") ?? undefined

  const options: TypeOrmModuleOptions = {
    type: "postgres",
    url: databaseUrl,
    entities,
    synchronize: false,
    migrationsRun: false,
    autoLoadEntities: false,
    logging: configService.get<string>("TYPEORM_LOGGING", "false").toLowerCase() === "true",
  }

  const extra = cloudSqlHost ? { ...(options.extra ?? {}), host: cloudSqlHost } : options.extra
  let ssl = options.ssl
  if (sslMode && sslMode !== "disable" && sslMode !== "allow") {
    const strictModes = new Set(["verify-ca", "verify-full"])
    ssl = { rejectUnauthorized: strictModes.has(sslMode) }
  }

  return {
    ...options,
    ...(extra ? { extra } : {}),
    ...(ssl ? { ssl } : {}),
  }
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
