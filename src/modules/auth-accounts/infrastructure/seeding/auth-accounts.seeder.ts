import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common"

import { AuthAccount } from "../../domain/entities/auth-account.entity"
import { AUTH_ACCOUNT_REPOSITORY_TOKEN, type AuthAccountRepositoryPort } from "../../domain/ports/auth-account-repository.port"
import { HASHING_SERVICE_TOKEN, type HashingPort } from "@/modules/shared/ports/hashing.port"
import { Member } from "@/modules/members/domain/entities/member.entity"
import { MEMBER_REPOSITORY_TOKEN, type MemberRepositoryPort } from "@/modules/members/domain/ports/member-repository.port"

const DEFAULT_ADMIN_EMAIL = "admin@whereisthelibrary.com"
const DEFAULT_ADMIN_PASSWORD = "A20020515o"
const DEFAULT_ADMIN_NAME = "Administrador"
const DEFAULT_ADMIN_PHONE = "+0000000000"

@Injectable()
export class AuthAccountsSeeder implements OnModuleInit {
  private readonly logger = new Logger(AuthAccountsSeeder.name)

  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY_TOKEN)
    private readonly authAccountRepository: AuthAccountRepositoryPort,
    @Inject(HASHING_SERVICE_TOKEN)
    private readonly hashingService: HashingPort,
    @Inject(MEMBER_REPOSITORY_TOKEN)
    private readonly memberRepository: MemberRepositoryPort,
  ) {}

  async onModuleInit(): Promise<void> {
    const existingAdmin = await this.authAccountRepository.findByEmail(DEFAULT_ADMIN_EMAIL)

    if (!existingAdmin) {
      const passwordHash = await this.hashingService.hash(DEFAULT_ADMIN_PASSWORD)
      const adminAccount = AuthAccount.create(DEFAULT_ADMIN_EMAIL, passwordHash)
      await this.authAccountRepository.save(adminAccount)
      this.logger.log(`Default admin auth account ensured for ${DEFAULT_ADMIN_EMAIL}`)
    }

    const existingMember = await this.memberRepository.findByEmail(DEFAULT_ADMIN_EMAIL)
    if (!existingMember) {
      const adminMember = Member.create(DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PHONE)
      await this.memberRepository.save(adminMember)
      this.logger.log(`Default admin member ensured for ${DEFAULT_ADMIN_EMAIL}`)
    }
  }
}
