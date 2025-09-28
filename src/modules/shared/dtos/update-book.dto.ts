import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, MaxLength, Matches } from "class-validator"

export class UpdateBookDto {
  @ApiProperty({ example: "Cien años de soledad", description: "Título actualizado del libro" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string

  @ApiProperty({ example: "Gabriel García Márquez", description: "Autor actualizado del libro" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author!: string

  @ApiProperty({
    example: "9783161484100",
    description: "Código ISBN actualizado del libro (10 o 13 dígitos)",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:\d{10}|\d{13})$/u, {
    message: "isbn must be a 10 or 13 digit numeric string",
  })
  isbn!: string
}
