import { Module, forwardRef } from "@nestjs/common"
import { LoansController } from "./infrastructure/controllers/loans.controller"
import { LoanBookUseCase } from "./application/use-cases/loan-book.use-case"
import { ReturnBookUseCase } from "./application/use-cases/return-book.use-case"
import { ListLoansUseCase } from "./application/use-cases/list-loans.use-case"
import { InMemoryLoanRepository } from "./infrastructure/repositories/in-memory-loan.repository"
import { LOAN_REPOSITORY_TOKEN } from "./domain/ports/loan-repository.port"
import { CatalogModule } from "../catalog/catalog.module"
import { MembersModule } from "../members/members.module"

@Module({
  imports: [forwardRef(() => CatalogModule), MembersModule],
  controllers: [LoansController],
  providers: [
    LoanBookUseCase,
    ReturnBookUseCase,
    ListLoansUseCase,
    {
      provide: LOAN_REPOSITORY_TOKEN,
      useClass: InMemoryLoanRepository,
    },
  ],
  exports: [LOAN_REPOSITORY_TOKEN],
})
export class LoansModule {}
