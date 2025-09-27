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

  @ApiProperty({ example: true, description: "Indica si el libro está disponible para préstamo" })
  available!: boolean

  static fromEntity(book: Book): BookResponseDto {
    const dto = new BookResponseDto()
    dto.id = book.id
    dto.title = book.title
    dto.author = book.author
    dto.available = book.available
    return dto
  }
}
