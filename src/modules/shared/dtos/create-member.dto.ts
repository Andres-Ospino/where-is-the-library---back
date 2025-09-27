import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsEmail, MaxLength } from "class-validator"

export class CreateMemberDto {
  @ApiProperty({ example: "Ana Gómez", description: "Nombre completo del nuevo miembro" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string

  @ApiProperty({ example: "ana.gomez@example.com", description: "Correo electrónico del nuevo miembro" })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string

}
