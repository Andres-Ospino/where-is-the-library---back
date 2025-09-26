import { IsNumber, IsPositive } from "class-validator"

export class CreateLoanDto {
  @IsNumber()
  @IsPositive()
  bookId: number

  @IsNumber()
  @IsPositive()
  memberId: number
}
