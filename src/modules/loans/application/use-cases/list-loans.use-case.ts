import { Inject, Injectable } from "@nestjs/common"
import type { Loan } from "../../domain/entities/loan.entity"
import { type LoanRepositoryPort, LOAN_REPOSITORY_TOKEN } from "../../domain/ports/loan-repository.port"

export interface ListLoansQuery {
  bookId?: number
  memberId?: number
  activeOnly?: boolean
}

@Injectable()
export class ListLoansUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY_TOKEN)
    private readonly loanRepository: LoanRepositoryPort,
  ) {}

  async execute(query?: ListLoansQuery): Promise<Loan[]> {
    if (query?.activeOnly) {
      return await this.loanRepository.findActiveLoans()
    }

    if (query?.bookId) {
      return await this.loanRepository.findByBookId(query.bookId)
    }

    if (query?.memberId) {
      return await this.loanRepository.findByMemberId(query.memberId)
    }

    return await this.loanRepository.findAll()
  }
}
