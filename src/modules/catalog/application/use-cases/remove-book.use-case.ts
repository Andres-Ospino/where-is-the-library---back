import { Injectable, Inject } from "@nestjs/common"
import { type BookRepositoryPort, BOOK_REPOSITORY_TOKEN } from "../../domain/ports/book-repository.port"
import { type LoanRepositoryPort, LOAN_REPOSITORY_TOKEN } from "@/modules/loans/domain/ports/loan-repository.port"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"
import { ConflictError } from "@/modules/shared/errors/conflict.error"

export interface RemoveBookCommand {
  id: number
}

@Injectable()
export class RemoveBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY_TOKEN)
    private readonly bookRepository: BookRepositoryPort,
    @Inject(LOAN_REPOSITORY_TOKEN)
    private readonly loanRepository: LoanRepositoryPort,
  ) {}

  async execute(command: RemoveBookCommand): Promise<void> {
    const book = await this.bookRepository.findById(command.id)
    if (!book) {
      throw new NotFoundError("Book", command.id)
    }

    // Check if book has active loans
    const activeLoan = await this.loanRepository.findActiveLoanByBookId(command.id)
    if (activeLoan) {
      throw new ConflictError("Cannot remove book with active loans")
    }

    await this.bookRepository.delete(command.id)
  }
}
