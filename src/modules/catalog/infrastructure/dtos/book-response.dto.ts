import { ApiProperty } from "@nestjs/swagger"

import type { Book } from "@/modules/catalog/domain/entities/book.entity"

export class BookResponseDto {
  @ApiProperty({
    example: 1,
    description: "Identificador único del libro",
    nullable: true,
  })
  id!: number | null

  @ApiProperty({ example: "El Quijote", description: "Título del libro" })
  title!: string

  @ApiProperty({ example: "Miguel de Cervantes", description: "Autor del libro" })
  author!: string

  @ApiProperty({ example: "9783161484100", description: "Código ISBN del libro" })
  isbn!: string

  @ApiProperty({ example: true, description: "Indica si el libro está disponible para préstamo" })
  available!: boolean

  static fromEntity(book: Book): BookResponseDto {
    const dto = new BookResponseDto()
    dto.id = book.id
    dto.title = book.title
    dto.author = book.author
    dto.isbn = book.isbn
    dto.available = book.available
    return dto
  }
}
