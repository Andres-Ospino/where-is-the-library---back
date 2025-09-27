import { Inject, Injectable } from "@nestjs/common"

import type { AuthAccount } from "../../domain/entities/auth-account.entity"
import { AUTH_ACCOUNT_REPOSITORY_TOKEN, type AuthAccountRepositoryPort } from "../../domain/ports/auth-account-repository.port"

@Injectable()
export class FindAuthAccountByEmailUseCase {
  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY_TOKEN)
    private readonly authAccountRepository: AuthAccountRepositoryPort,
  ) {}

  async execute(email: string): Promise<AuthAccount | null> {
    return await this.authAccountRepository.findByEmail(email)
  }
}
