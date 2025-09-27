import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsPositive } from "class-validator"

export class CreateLoanDto {
  @ApiProperty({ example: 10, description: "Identificador del libro a prestar" })
  @IsNumber()
  @IsPositive()
  bookId!: number

  @ApiProperty({ example: 5, description: "Identificador del miembro que solicita el préstamo" })
  @IsNumber()
  @IsPositive()
  memberId!: number
}
