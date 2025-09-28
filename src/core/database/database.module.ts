import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule, type TypeOrmModuleOptions } from "@nestjs/typeorm"
import { BookOrmEntity } from "@/modules/catalog/infrastructure/persistence/typeorm/book.orm-entity"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"
import { LoanOrmEntity } from "@/modules/loans/infrastructure/persistence/typeorm/loan.orm-entity"
import { AuthAccountOrmEntity } from "@/modules/auth-accounts/infrastructure/persistence/typeorm/auth-account.orm-entity"
import { LibraryOrmEntity } from "@/modules/libraries/infrastructure/persistence/typeorm/library.orm-entity"
import { CreateAuthAccountsTable1717094400000 } from "./migrations/1717094400000-create-auth-accounts-table"
import { CreateMembersBooksLoansTables1717094401000 } from "./migrations/1717094401000-create-members-books-loans-tables"
import { AddIsbnToBooksTable1717094402000 } from "./migrations/1717094402000-add-isbn-to-books-table"
import { AddPhoneToMembersTable1719000000000 } from "./migrations/1719000000000-add-phone-to-members-table"
import { CreateLibrariesTable1719500000000 } from "./migrations/1719500000000-create-libraries-table"
import { AddLibraryIdToBooksTable1719500001000 } from "./migrations/1719500001000-add-library-id-to-books-table"
import { cloudSqlDefaults } from "@/config/cloudsql.config"

function buildTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
  const nodeEnv = configService.get<string>("NODE_ENV")
  const entities = [BookOrmEntity, MemberOrmEntity, LoanOrmEntity, AuthAccountOrmEntity, LibraryOrmEntity]
  const migrations = [
    CreateAuthAccountsTable1717094400000,
    CreateMembersBooksLoansTables1717094401000,
    AddIsbnToBooksTable1717094402000,
    AddPhoneToMembersTable1719000000000,
    CreateLibrariesTable1719500000000,
    AddLibraryIdToBooksTable1719500001000,
  ]

  if (nodeEnv === "test") {
    return {
      type: "sqlite",
      database: ":memory:",
      entities,
      migrations,
      synchronize: true,
      dropSchema: true,
      migrationsRun: false,
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

  const shouldRunMigrations = nodeEnv !== "test"

  const options: TypeOrmModuleOptions = {
    type: "postgres",
    url: databaseUrl,
    entities,
    migrations,
    synchronize: false,
    migrationsRun: shouldRunMigrations,
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
