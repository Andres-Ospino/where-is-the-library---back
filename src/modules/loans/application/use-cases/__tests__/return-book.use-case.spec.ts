import { ReturnBookUseCase } from "../return-book.use-case"
import { Loan } from "../../../domain/entities/loan.entity"
import { Book } from "@/modules/catalog/domain/entities/book.entity"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"
import { ConflictError } from "@/modules/shared/errors/conflict.error"
import type { LoanRepositoryPort } from "../../../domain/ports/loan-repository.port"
import type { BookRepositoryPort } from "@/modules/catalog/domain/ports/book-repository.port"
import type { DateProviderPort } from "@/modules/shared/ports/date-provider.port"
import type { EventBusPort } from "@/modules/shared/ports/event-bus.port"
import { LoanReturnedEvent } from "../../../domain/events/loan-returned.event"

describe("ReturnBookUseCase", () => {
  let useCase: ReturnBookUseCase
  let mockLoanRepository: jest.Mocked<LoanRepositoryPort>
  let mockBookRepository: jest.Mocked<BookRepositoryPort>
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

    mockDateProvider = {
      now: jest.fn(),
    } as jest.Mocked<DateProviderPort>

    mockEventBus = {
      publish: jest.fn(),
    } as jest.Mocked<EventBusPort>

    useCase = new ReturnBookUseCase(
      mockLoanRepository,
      mockBookRepository,
      mockDateProvider,
      mockEventBus,
    )
  })

  it("should return a book successfully", async () => {
    const command = { loanId: 1 }
    const loanDate = new Date("2024-01-01T10:00:00Z")
    const returnDate = new Date("2024-01-05T10:00:00Z")
    const loan = Loan.fromPersistence(1, 10, 20, loanDate)
    const book = Book.fromPersistence(10, "Clean Code", "Robert C. Martin", "1234567890", false, null)

    mockLoanRepository.findById.mockResolvedValue(loan)
    mockBookRepository.findById.mockResolvedValue(book)
    mockDateProvider.now.mockReturnValue(returnDate)
    mockLoanRepository.update.mockImplementation(async () => loan)

    const result = await useCase.execute(command)

    expect(mockLoanRepository.findById).toHaveBeenCalledWith(1)
    expect(mockBookRepository.findById).toHaveBeenCalledWith(loan.bookId)
    expect(mockLoanRepository.update).toHaveBeenCalledWith(loan)
    expect(loan.isReturned).toBe(true)
    expect(loan.returnDate).toEqual(returnDate)
    expect(mockBookRepository.update).toHaveBeenCalledWith(book)
    expect(book.available).toBe(true)
    expect(result).toBe(loan)

    expect(mockEventBus.publish).toHaveBeenCalled()
    const publishedEvent = mockEventBus.publish.mock.calls[0][0] as LoanReturnedEvent
    expect(publishedEvent).toBeInstanceOf(LoanReturnedEvent)
    expect(publishedEvent.loanId).toBe(command.loanId)
    expect(publishedEvent.bookId).toBe(loan.bookId)
    expect(publishedEvent.memberId).toBe(loan.memberId)
    expect(publishedEvent.returnDate).toEqual(returnDate)
  })

  it("should throw NotFoundError when loan does not exist", async () => {
    mockLoanRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute({ loanId: 999 })).rejects.toThrow(NotFoundError)
    expect(mockLoanRepository.findById).toHaveBeenCalledWith(999)
  })

  it("should throw ConflictError when loan is already returned", async () => {
    const loanDate = new Date("2024-01-01T10:00:00Z")
    const loan = Loan.fromPersistence(1, 10, 20, loanDate, new Date("2024-01-03T10:00:00Z"))

    mockLoanRepository.findById.mockResolvedValue(loan)

    await expect(useCase.execute({ loanId: 1 })).rejects.toThrow(ConflictError)
    expect(mockLoanRepository.update).not.toHaveBeenCalled()
  })

  it("should throw NotFoundError when the book linked to the loan does not exist", async () => {
    const loanDate = new Date("2024-01-01T10:00:00Z")
    const loan = Loan.fromPersistence(1, 10, 20, loanDate)

    mockLoanRepository.findById.mockResolvedValue(loan)
    mockBookRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute({ loanId: 1 })).rejects.toThrow(NotFoundError)
    expect(mockBookRepository.findById).toHaveBeenCalledWith(loan.bookId)
    expect(mockLoanRepository.update).not.toHaveBeenCalled()
  })
})
