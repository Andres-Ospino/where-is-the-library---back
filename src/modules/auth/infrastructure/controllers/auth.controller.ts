import { Body, Controller, Post, ValidationPipe } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"

import type { LoginResult } from "@/modules/auth/application/use-cases/login.use-case"
import { LoginUseCase } from "@/modules/auth/application/use-cases/login.use-case"
import { LoginDto } from "@/modules/auth/dtos/login.dto"
import { Public } from "@/modules/auth/decorators/public.decorator"
import { LoginResponseDto } from "@/modules/auth/dtos/login-response.dto"

@ApiTags("Autenticación")
@Controller("auth")
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Obtener un token JWT" })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: "Autenticación exitosa", type: LoginResponseDto })
  @ApiBadRequestResponse({ description: "Datos de entrada inválidos" })
  @ApiUnauthorizedResponse({ description: "Credenciales inválidas" })
  async login(@Body(new ValidationPipe()) loginDto: LoginDto): Promise<LoginResponseDto> {
    const result: LoginResult = await this.loginUseCase.execute({
      email: loginDto.email,
      password: loginDto.password,
    })

    return LoginResponseDto.fromResult(result)
  }
}
