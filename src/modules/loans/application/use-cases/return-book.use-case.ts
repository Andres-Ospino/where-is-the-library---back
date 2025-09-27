import { Inject, Injectable } from "@nestjs/common"
import type { Loan } from "../../domain/entities/loan.entity"
import { type LoanRepositoryPort, LOAN_REPOSITORY_TOKEN } from "../../domain/ports/loan-repository.port"
import { type BookRepositoryPort, BOOK_REPOSITORY_TOKEN } from "@/modules/catalog/domain/ports/book-repository.port"
import { type DateProviderPort, DATE_PROVIDER_TOKEN } from "@/modules/shared/ports/date-provider.port"
import { type EventBusPort, EVENT_BUS_TOKEN } from "@/modules/shared/ports/event-bus.port"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"
import { ConflictError } from "@/modules/shared/errors/conflict.error"
import { LoanReturnedEvent } from "../../domain/events/loan-returned.event"

export interface ReturnBookCommand {
  loanId: number
}

@Injectable()
export class ReturnBookUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY_TOKEN)
    private readonly loanRepository: LoanRepositoryPort,
    @Inject(BOOK_REPOSITORY_TOKEN)
    private readonly bookRepository: BookRepositoryPort,
    @Inject(DATE_PROVIDER_TOKEN)
    private readonly dateProvider: DateProviderPort,
    @Inject(EVENT_BUS_TOKEN)
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(command: ReturnBookCommand): Promise<Loan> {
    // Find loan
    const loan = await this.loanRepository.findById(command.loanId)
    if (!loan) {
      throw new NotFoundError("Loan", command.loanId)
    }

    // Check if loan is already returned
    if (loan.isReturned) {
      throw new ConflictError("Loan has already been returned")
    }

    // Find book
    const book = await this.bookRepository.findById(loan.bookId)
    if (!book) {
      throw new NotFoundError("Book", loan.bookId)
    }

    // Return loan
    const returnDate = this.dateProvider.now()
    loan.returnBook(returnDate)
    const updatedLoan = await this.loanRepository.update(loan)

    // Mark book as available
    book.markAsAvailable()
    await this.bookRepository.update(book)

    // Publish domain event
    const event = new LoanReturnedEvent(command.loanId, loan.bookId, loan.memberId, returnDate)
    await this.eventBus.publish(event)

    return updatedLoan
  }
}
