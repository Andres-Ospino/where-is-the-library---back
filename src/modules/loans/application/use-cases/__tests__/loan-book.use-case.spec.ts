import { LoanBookUseCase } from "../loan-book.use-case"
import { Book } from "@/modules/catalog/domain/entities/book.entity"
import { Member } from "@/modules/members/domain/entities/member.entity"
import { Loan } from "../../../domain/entities/loan.entity"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"
import { ConflictError } from "@/modules/shared/errors/conflict.error"
import { LoanCreatedEvent } from "../../../domain/events/loan-created.event"
import type { LoanRepositoryPort } from "../../../domain/ports/loan-repository.port"
import type { BookRepositoryPort } from "@/modules/catalog/domain/ports/book-repository.port"
import type { MemberRepositoryPort } from "@/modules/members/domain/ports/member-repository.port"
import type { DateProviderPort } from "@/modules/shared/ports/date-provider.port"
import type { EventBusPort } from "@/modules/shared/ports/event-bus.port"
describe("LoanBookUseCase", () => {
  let useCase: LoanBookUseCase
  let mockLoanRepository: jest.Mocked<LoanRepositoryPort>
  let mockBookRepository: jest.Mocked<BookRepositoryPort>
  let mockMemberRepository: jest.Mocked<MemberRepositoryPort>
  let mockDateProvider: jest.Mocked<DateProviderPort>
  let mockEventBus: jest.Mocked<EventBusPort>

  beforeEach(() => {
    mockLoanRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByBookId: jest.fn(),
      findByMemberId: jest.fn(),
      findActiveLoans: jest.fn(),
      findActiveLoanByBookId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<LoanRepositoryPort>

    mockBookRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByTitle: jest.fn(),
      findByAuthor: jest.fn(),
    } as jest.Mocked<BookRepositoryPort>

    mockMemberRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<MemberRepositoryPort>

    mockDateProvider = {
      now: jest.fn(),
    } as jest.Mocked<DateProviderPort>

    mockEventBus = {
      publish: jest.fn(),
    } as jest.Mocked<EventBusPort>

    useCase = new LoanBookUseCase(
      mockLoanRepository,
      mockBookRepository,
      mockMemberRepository,
      mockDateProvider,
      mockEventBus,
    )
  })

  const memberPhone = "+44123456789"

  it("should loan a book successfully", async () => {
    // Arrange
    const command = { bookId: 1, memberId: 1 }
    const book = Book.fromPersistence(1, "Test Book", "Test Author", "1234567890", true)
    const member = Member.fromPersistence(1, "John Doe", "john@example.com", memberPhone)
    const loanDate = new Date("2024-01-15")
    const loan = Loan.fromPersistence(1, 1, 1, loanDate)

    mockBookRepository.findById.mockResolvedValue(book)
    mockMemberRepository.findById.mockResolvedValue(member)
    mockLoanRepository.findActiveLoanByBookId.mockResolvedValue(null)
    mockDateProvider.now.mockReturnValue(loanDate)
    mockLoanRepository.save.mockResolvedValue(loan)

    // Act
    const result = await useCase.execute(command)

    // Assert
    expect(mockBookRepository.findById).toHaveBeenCalledWith(1)
    expect(mockMemberRepository.findById).toHaveBeenCalledWith(1)
    expect(mockLoanRepository.findActiveLoanByBookId).toHaveBeenCalledWith(1)
    expect(mockBookRepository.update).toHaveBeenCalledWith(book)
    expect(book.available).toBe(false)
    expect(mockEventBus.publish).toHaveBeenCalled()
    const publishedEvent = mockEventBus.publish.mock.calls[0][0] as LoanCreatedEvent
    expect(publishedEvent).toBeInstanceOf(LoanCreatedEvent)
    expect(publishedEvent.loanId).toBe(loan.id)
    expect(publishedEvent.bookId).toBe(command.bookId)
    expect(publishedEvent.memberId).toBe(command.memberId)
    expect(publishedEvent.loanDate).toEqual(loanDate)
    expect(result).toEqual(loan)
  })

  it("should throw NotFoundError when book does not exist", async () => {
    // Arrange
    const command = { bookId: 999, memberId: 1 }
    mockBookRepository.findById.mockResolvedValue(null)

    // Act & Assert
    await expect(useCase.execute(command)).rejects.toThrow(NotFoundError)
    expect(mockBookRepository.findById).toHaveBeenCalledWith(999)
  })

  it("should throw NotFoundError when member does not exist", async () => {
    // Arrange
    const command = { bookId: 1, memberId: 999 }
    const book = Book.fromPersistence(1, "Test Book", "Test Author", "1234567890", true)

    mockBookRepository.findById.mockResolvedValue(book)
    mockMemberRepository.findById.mockResolvedValue(null)

    // Act & Assert
    await expect(useCase.execute(command)).rejects.toThrow(NotFoundError)
    expect(mockMemberRepository.findById).toHaveBeenCalledWith(999)
  })

  it("should throw ConflictError when book is not available", async () => {
    // Arrange
    const command = { bookId: 1, memberId: 1 }
    const book = Book.fromPersistence(1, "Test Book", "Test Author", "1234567890", false)
    const member = Member.fromPersistence(1, "John Doe", "john@example.com", memberPhone)

    mockBookRepository.findById.mockResolvedValue(book)
    mockMemberRepository.findById.mockResolvedValue(member)

    // Act & Assert
    await expect(useCase.execute(command)).rejects.toThrow(ConflictError)
  })

  it("should throw ConflictError when an active loan already exists for the book", async () => {
    const command = { bookId: 1, memberId: 1 }
    const book = Book.fromPersistence(1, "Test Book", "Test Author", "1234567890", true)
    const member = Member.fromPersistence(1, "John Doe", "john@example.com", memberPhone)
    const activeLoan = Loan.fromPersistence(2, 1, 2, new Date("2024-01-10"))

    mockBookRepository.findById.mockResolvedValue(book)
    mockMemberRepository.findById.mockResolvedValue(member)
    mockLoanRepository.findActiveLoanByBookId.mockResolvedValue(activeLoan)

    await expect(useCase.execute(command)).rejects.toThrow(ConflictError)
    expect(mockLoanRepository.findActiveLoanByBookId).toHaveBeenCalledWith(command.bookId)
    expect(mockLoanRepository.save).not.toHaveBeenCalled()
  })
})
