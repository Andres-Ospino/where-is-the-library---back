import { ApiProperty } from "@nestjs/swagger"
import type { Book } from "@/modules/catalog/domain/entities/book.entity"

export class LibraryBookResponseDto {
  @ApiProperty({ example: 1, description: "Identificador del libro" })
  id!: number

  @ApiProperty({ example: "El Quijote", description: "Título del libro" })
  title!: string

  @ApiProperty({ example: "Miguel de Cervantes", description: "Autor del libro" })
  author!: string

  @ApiProperty({ example: "9783161484100", description: "Código ISBN del libro" })
  isbn!: string

  @ApiProperty({ example: true, description: "Disponibilidad del libro" })
  available!: boolean

  static fromEntity(book: Book): LibraryBookResponseDto {
    const dto = new LibraryBookResponseDto()
    dto.id = book.id as number
    dto.title = book.title
    dto.author = book.author
    dto.isbn = book.isbn
    dto.available = book.available
    return dto
  }
}
