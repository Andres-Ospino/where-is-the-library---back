import { ApiProperty } from "@nestjs/swagger"

import type { LoginResult } from "@/modules/auth/application/use-cases/login.use-case"

export class LoginResponseDto {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "Token JWT de acceso" })
  accessToken!: string

  @ApiProperty({ example: "Bearer", description: "Tipo de token" })
  tokenType!: "Bearer"

  @ApiProperty({ example: 3600, description: "Tiempo de expiración del token en segundos", required: false })
  expiresIn?: number

  static fromResult(result: LoginResult): LoginResponseDto {
    const dto = new LoginResponseDto()
    dto.accessToken = result.accessToken
    dto.tokenType = result.tokenType
    dto.expiresIn = result.expiresIn
    return dto
  }
}
