import { Inject, Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"

import { HASHING_SERVICE_TOKEN, type HashingPort } from "@/modules/shared/ports/hashing.port"
import { AUTH_ACCOUNT_REPOSITORY_TOKEN, type AuthAccountRepositoryPort } from "@/modules/auth-accounts/domain/ports/auth-account-repository.port"
import { FindMemberByEmailUseCase } from "@/modules/members/application/use-cases/find-member-by-email.use-case"

export interface LoginCommand {
  email: string
  password: string
}

export interface LoginResult {
  accessToken: string
  tokenType: "Bearer"
  expiresIn?: number
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY_TOKEN)
    private readonly authAccountRepository: AuthAccountRepositoryPort,
    private readonly jwtService: JwtService,
    @Inject(HASHING_SERVICE_TOKEN)
    private readonly hashingService: HashingPort,
    private readonly findMemberByEmailUseCase: FindMemberByEmailUseCase,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const authAccount = await this.authAccountRepository.findByEmail(command.email)
    if (!authAccount) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const isValidPassword = await this.hashingService.compare(command.password, authAccount.passwordHash)
    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const member = await this.findMemberByEmailUseCase.execute(command.email)
    if (!member) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const memberId = member.id
    if (!memberId) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const payload = {
      sub: memberId,
      email: member.email,
      name: member.name,
    }

    const accessToken = await this.jwtService.signAsync(payload)
    const decoded = this.jwtService.decode(accessToken)
    let expiresIn: number | undefined

    if (decoded && typeof decoded === "object" && "exp" in decoded && typeof decoded.exp === "number") {
      expiresIn = decoded.exp - Math.floor(Date.now() / 1000)
    }

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn,
    }
  }
}
