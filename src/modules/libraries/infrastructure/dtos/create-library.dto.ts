import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, MaxLength } from "class-validator"

export class CreateLibraryDto {
  @ApiProperty({ example: "Biblioteca Central", description: "Nombre de la biblioteca" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string

  @ApiProperty({ example: "Av. Siempre Viva 123", description: "Dirección de la biblioteca" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address!: string

  @ApiProperty({ example: "Lunes a Viernes 09:00-18:00", description: "Horario de atención" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  openingHours!: string
}
