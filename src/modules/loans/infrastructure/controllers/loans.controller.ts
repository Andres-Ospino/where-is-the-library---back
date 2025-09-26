import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from "@nestjs/common"
import type { LoanBookUseCase } from "../../application/use-cases/loan-book.use-case"
import type { ReturnBookUseCase } from "../../application/use-cases/return-book.use-case"
import type { ListLoansUseCase } from "../../application/use-cases/list-loans.use-case"
import type { CreateLoanDto } from "@/modules/shared/dtos/create-loan.dto"

@Controller("loans")
export class LoansController {
  constructor(
    private readonly loanBookUseCase: LoanBookUseCase,
    private readonly returnBookUseCase: ReturnBookUseCase,
    private readonly listLoansUseCase: ListLoansUseCase,
  ) {}

  @Post()
  async create(@Body() createLoanDto: CreateLoanDto) {
    const loan = await this.loanBookUseCase.execute({
      bookId: createLoanDto.bookId,
      memberId: createLoanDto.memberId,
    });

    return {
      id: loan.id,
      bookId: loan.bookId,
      memberId: loan.memberId,
      loanDate: loan.loanDate,
      returnDate: loan.returnDate,
      isReturned: loan.isReturned,
    };
  }

  @Post(':id/return')
  async returnBook(@Param('id', ParseIntPipe) id: number) {
    const loan = await this.returnBookUseCase.execute({ loanId: id });

    return {
      id: loan.id,
      bookId: loan.bookId,
      memberId: loan.memberId,
      loanDate: loan.loanDate,
      returnDate: loan.returnDate,
      isReturned: loan.isReturned,
    };
  }

  @Get()
  async findAll(
    @Query('bookId', ParseIntPipe) bookId?: number,
    @Query('memberId', ParseIntPipe) memberId?: number,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const loans = await this.listLoansUseCase.execute({
      bookId,
      memberId,
      activeOnly: activeOnly === "true",
    })

    return loans.map((loan) => ({
      id: loan.id,
      bookId: loan.bookId,
      memberId: loan.memberId,
      loanDate: loan.loanDate,
      returnDate: loan.returnDate,
      isReturned: loan.isReturned,
    }))
  }
}
