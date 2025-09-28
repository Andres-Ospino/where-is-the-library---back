import { ApiProperty } from "@nestjs/swagger"
import { Library } from "../../domain/entities/library.entity"
import { LibraryBookResponseDto } from "./library-book-response.dto"

export class LibraryResponseDto {
  @ApiProperty({ example: 1, description: "Identificador de la biblioteca" })
  id!: number

  @ApiProperty({ example: "Biblioteca Central", description: "Nombre de la biblioteca" })
  name!: string

  @ApiProperty({ example: "Av. Siempre Viva 123", description: "Dirección de la biblioteca" })
  address!: string

  @ApiProperty({ example: "Lunes a Viernes 09:00-18:00", description: "Horario de atención" })
  openingHours!: string

  @ApiProperty({
    description: "Libros disponibles en la biblioteca",
    type: LibraryBookResponseDto,
    isArray: true,
  })
  books!: LibraryBookResponseDto[]

  static fromEntity(library: Library): LibraryResponseDto {
    const dto = new LibraryResponseDto()
    dto.id = library.id as number
    dto.name = library.name
    dto.address = library.address
    dto.openingHours = library.openingHours
    dto.books = library.books.map((book) => LibraryBookResponseDto.fromEntity(book))
    return dto
  }
}
