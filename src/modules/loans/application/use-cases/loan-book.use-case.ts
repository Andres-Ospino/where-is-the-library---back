import { Inject, Injectable } from "@nestjs/common"
import { Loan } from "../../domain/entities/loan.entity"
import { type LoanRepositoryPort, LOAN_REPOSITORY_TOKEN } from "../../domain/ports/loan-repository.port"
import { type BookRepositoryPort, BOOK_REPOSITORY_TOKEN } from "@/modules/catalog/domain/ports/book-repository.port"
import {
  type MemberRepositoryPort,
  MEMBER_REPOSITORY_TOKEN,
} from "@/modules/members/domain/ports/member-repository.port"
import { type DateProviderPort, DATE_PROVIDER_TOKEN } from "@/modules/shared/ports/date-provider.port"
import { type EventBusPort, EVENT_BUS_TOKEN } from "@/modules/shared/ports/event-bus.port"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"
import { ConflictError } from "@/modules/shared/errors/conflict.error"
import { LoanCreatedEvent } from "../../domain/events/loan-created.event"

export interface LoanBookCommand {
  bookId: number
  memberId: number
}

@Injectable()
export class LoanBookUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY_TOKEN)
    private readonly loanRepository: LoanRepositoryPort,
    @Inject(BOOK_REPOSITORY_TOKEN)
    private readonly bookRepository: BookRepositoryPort,
    @Inject(MEMBER_REPOSITORY_TOKEN)
    private readonly memberRepository: MemberRepositoryPort,
    @Inject(DATE_PROVIDER_TOKEN)
    private readonly dateProvider: DateProviderPort,
    @Inject(EVENT_BUS_TOKEN)
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(command: LoanBookCommand): Promise<Loan> {
    // Validate book exists
    const book = await this.bookRepository.findById(command.bookId)
    if (!book) {
      throw new NotFoundError("Book", command.bookId)
    }

    // Validate member exists
    const member = await this.memberRepository.findById(command.memberId)
    if (!member) {
      throw new NotFoundError("Member", command.memberId)
    }

    // Check if book is available
    if (!book.available) {
      throw new ConflictError("Book is not available for loan")
    }

    // Check if book already has an active loan
    const activeLoan = await this.loanRepository.findActiveLoanByBookId(command.bookId)
    if (activeLoan) {
      throw new ConflictError("Book already has an active loan")
    }

    // Create loan
    const loanDate = this.dateProvider.now()
    const loan = Loan.create(command.bookId, command.memberId, loanDate)
    const savedLoan = await this.loanRepository.save(loan)

    // Mark book as unavailable
    book.markAsUnavailable()
    await this.bookRepository.update(book)

    // Publish domain event
    if (savedLoan.id) {
      const event = new LoanCreatedEvent(savedLoan.id, command.bookId, command.memberId, loanDate)
      await this.eventBus.publish(event)
    }

    return savedLoan
  }
}
