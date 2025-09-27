import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

export class LoginDto {
  @ApiProperty({ example: "usuario@example.com", description: "Correo electrónico registrado" })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string

  @ApiProperty({ example: "ContraseñaSegura123", description: "Contraseña del usuario" })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password!: string
}
