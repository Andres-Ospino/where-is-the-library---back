import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, MaxLength } from "class-validator"

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
}
