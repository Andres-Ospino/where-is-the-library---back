import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"

import { MembersModule } from "@/modules/members/members.module"
import { AuthAccountsModule } from "@/modules/auth-accounts/auth-accounts.module"
import { LoginUseCase } from "@/modules/auth/application/use-cases/login.use-case"
import { AuthController } from "@/modules/auth/infrastructure/controllers/auth.controller"
import { JwtStrategy } from "@/modules/auth/infrastructure/strategies/jwt.strategy"
import { JwtAuthGuard } from "@/modules/auth/infrastructure/guards/jwt-auth.guard"

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "default_jwt_secret"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN", "7d"),
        },
      }),
      inject: [ConfigService],
    }),
    MembersModule,
    AuthAccountsModule,
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
