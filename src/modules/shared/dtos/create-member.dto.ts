import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsEmail, MaxLength, Matches } from "class-validator"

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

  @ApiProperty({ example: "+34 600 123 456", description: "Número de contacto del nuevo miembro" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[0-9+()\-\s]{7,20}$/, {
    message: "phone must contain between 7 and 20 characters using digits, spaces, parentheses, plus or hyphen symbols",
  })
  phone!: string

}
