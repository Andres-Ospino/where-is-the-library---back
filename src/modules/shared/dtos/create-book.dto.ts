import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, MaxLength } from "class-validator"

export class CreateBookDto {
  @ApiProperty({ example: "El principito", description: "Título del libro" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string

  @ApiProperty({ example: "Antoine de Saint-Exupéry", description: "Autor del libro" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author!: string
}
