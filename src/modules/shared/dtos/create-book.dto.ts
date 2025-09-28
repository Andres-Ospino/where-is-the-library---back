import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsNotEmpty, MaxLength, Matches, IsOptional, IsInt, Min } from "class-validator"

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

  @ApiProperty({
    example: "9783161484100",
    description: "Código ISBN único del libro (10 o 13 dígitos)",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:\d{10}|\d{13})$/u, {
    message: "isbn must be a 10 or 13 digit numeric string",
  })
  isbn!: string

  @ApiPropertyOptional({
    example: 1,
    description: "Identificador de la biblioteca a la que pertenece el libro",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  libraryId?: number
}
