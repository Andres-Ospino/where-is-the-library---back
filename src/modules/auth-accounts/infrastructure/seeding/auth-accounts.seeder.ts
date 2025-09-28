import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common"

import { AuthAccount } from "../../domain/entities/auth-account.entity"
import { AUTH_ACCOUNT_REPOSITORY_TOKEN, type AuthAccountRepositoryPort } from "../../domain/ports/auth-account-repository.port"
import { HASHING_SERVICE_TOKEN, type HashingPort } from "@/modules/shared/ports/hashing.port"

const DEFAULT_ADMIN_EMAIL = "admin@whereisthelibrary.com"
const DEFAULT_ADMIN_PASSWORD = "A20020515o"

@Injectable()
export class AuthAccountsSeeder implements OnModuleInit {
  private readonly logger = new Logger(AuthAccountsSeeder.name)

  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY_TOKEN)
    private readonly authAccountRepository: AuthAccountRepositoryPort,
    @Inject(HASHING_SERVICE_TOKEN)
    private readonly hashingService: HashingPort,
  ) {}

  async onModuleInit(): Promise<void> {
    const existingAdmin = await this.authAccountRepository.findByEmail(DEFAULT_ADMIN_EMAIL)
    if (existingAdmin) {
      return
    }

    const passwordHash = await this.hashingService.hash(DEFAULT_ADMIN_PASSWORD)
    const adminAccount = AuthAccount.create(DEFAULT_ADMIN_EMAIL, passwordHash)
    await this.authAccountRepository.save(adminAccount)
    this.logger.log(`Default admin auth account ensured for ${DEFAULT_ADMIN_EMAIL}`)
  }
}
