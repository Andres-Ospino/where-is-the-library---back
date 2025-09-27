import { Module, forwardRef } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { LoansController } from "./infrastructure/controllers/loans.controller"
import { LoanBookUseCase } from "./application/use-cases/loan-book.use-case"
import { ReturnBookUseCase } from "./application/use-cases/return-book.use-case"
import { ListLoansUseCase } from "./application/use-cases/list-loans.use-case"
import { LOAN_REPOSITORY_TOKEN } from "./domain/ports/loan-repository.port"
import { CatalogModule } from "../catalog/catalog.module"
import { MembersModule } from "../members/members.module"
import { TypeormLoanRepository } from "./infrastructure/repositories/typeorm-loan.repository"
import { LoanOrmEntity } from "./infrastructure/persistence/typeorm/loan.orm-entity"

@Module({
  imports: [forwardRef(() => CatalogModule), MembersModule, TypeOrmModule.forFeature([LoanOrmEntity])],
  controllers: [LoansController],
  providers: [
    LoanBookUseCase,
    ReturnBookUseCase,
    ListLoansUseCase,
    {
      provide: LOAN_REPOSITORY_TOKEN,
      useClass: TypeormLoanRepository,
    },
  ],
  exports: [LOAN_REPOSITORY_TOKEN],
})
export class LoansModule {}
