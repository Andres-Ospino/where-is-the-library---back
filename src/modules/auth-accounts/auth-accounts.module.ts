import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { FindAuthAccountByEmailUseCase } from "./application/use-cases/find-auth-account-by-email.use-case"
import { AUTH_ACCOUNT_REPOSITORY_TOKEN } from "./domain/ports/auth-account-repository.port"
import { AuthAccountOrmEntity } from "./infrastructure/persistence/typeorm/auth-account.orm-entity"
import { TypeormAuthAccountRepository } from "./infrastructure/repositories/typeorm-auth-account.repository"
import { AuthAccountsSeeder } from "./infrastructure/seeding/auth-accounts.seeder"
import { MembersModule } from "@/modules/members/members.module"

@Module({
  imports: [TypeOrmModule.forFeature([AuthAccountOrmEntity]), MembersModule],
  providers: [
    FindAuthAccountByEmailUseCase,
    AuthAccountsSeeder,
    {
      provide: AUTH_ACCOUNT_REPOSITORY_TOKEN,
      useClass: TypeormAuthAccountRepository,
    },
  ],
  exports: [AUTH_ACCOUNT_REPOSITORY_TOKEN, FindAuthAccountByEmailUseCase, TypeOrmModule],
})
export class AuthAccountsModule {}
