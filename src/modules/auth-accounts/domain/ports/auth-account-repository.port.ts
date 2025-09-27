import type { AuthAccount } from "../entities/auth-account.entity"

export const AUTH_ACCOUNT_REPOSITORY_TOKEN = Symbol("AuthAccountRepository")

export interface AuthAccountRepositoryPort {
  findByEmail(email: string): Promise<AuthAccount | null>
  save(account: AuthAccount): Promise<AuthAccount>
}
