import { ApiProperty } from "@nestjs/swagger"

import type { Loan } from "@/modules/loans/domain/entities/loan.entity"

export class LoanResponseDto {
  @ApiProperty({ example: 1, description: "Identificador único del préstamo", nullable: true })
  id!: number | null

  @ApiProperty({ example: 12, description: "Identificador del libro prestado" })
  bookId!: number

  @ApiProperty({ example: 7, description: "Identificador del miembro que realiza el préstamo" })
  memberId!: number

  @ApiProperty({
    example: "2024-03-01T10:00:00.000Z",
    description: "Fecha en la que se realizó el préstamo",
    type: String,
    format: "date-time",
  })
  loanDate!: string

  @ApiProperty({
    example: "2024-03-15T10:00:00.000Z",
    description: "Fecha de devolución del libro, si ya fue devuelto",
    type: String,
    format: "date-time",
    nullable: true,
  })
  returnDate!: string | null

  @ApiProperty({ example: false, description: "Indica si el libro ya fue devuelto" })
  isReturned!: boolean

  static fromEntity(loan: Loan): LoanResponseDto {
    const dto = new LoanResponseDto()
    dto.id = loan.id
    dto.bookId = loan.bookId
    dto.memberId = loan.memberId
    dto.loanDate = loan.loanDate.toISOString()
    dto.returnDate = loan.returnDate ? loan.returnDate.toISOString() : null
    dto.isReturned = loan.isReturned
    return dto
  }
}
