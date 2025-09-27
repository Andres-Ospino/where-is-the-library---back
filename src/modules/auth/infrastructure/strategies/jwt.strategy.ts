import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

export interface JwtPayload {
  sub: number
  email: string
  name: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET", "default_jwt_secret"),
    })
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return payload
  }
}
