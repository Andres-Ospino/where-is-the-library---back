import { Body, Controller, Post, ValidationPipe } from "@nestjs/common"

import { LoginUseCase } from "@/modules/auth/application/use-cases/login.use-case"
import { LoginDto } from "@/modules/auth/dtos/login.dto"
import { Public } from "@/modules/auth/decorators/public.decorator"

@Controller("auth")
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @Post("login")
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    return await this.loginUseCase.execute({
      email: loginDto.email,
      password: loginDto.password,
    })
  }
}
