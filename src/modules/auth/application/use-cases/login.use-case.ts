import { Inject, Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"

import { MEMBER_REPOSITORY_TOKEN, type MemberRepositoryPort } from "@/modules/members/domain/ports/member-repository.port"
import { HASHING_SERVICE_TOKEN, type HashingPort } from "@/modules/shared/ports/hashing.port"

export interface LoginCommand {
  email: string
  password: string
}

interface LoginResult {
  accessToken: string
  tokenType: "Bearer"
  expiresIn?: number
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY_TOKEN)
    private readonly memberRepository: MemberRepositoryPort,
    private readonly jwtService: JwtService,
    @Inject(HASHING_SERVICE_TOKEN)
    private readonly hashingService: HashingPort,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const member = await this.memberRepository.findByEmail(command.email)
    if (!member) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const isValidPassword = await this.hashingService.compare(command.password, member.passwordHash)
    if (!isValidPassword) {
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
