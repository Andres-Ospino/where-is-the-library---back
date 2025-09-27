import { ListLoansUseCase } from "../list-loans.use-case"
import type { LoanRepositoryPort } from "../../../domain/ports/loan-repository.port"
import { Loan } from "../../../domain/entities/loan.entity"

describe("ListLoansUseCase", () => {
  let useCase: ListLoansUseCase
  let mockLoanRepository: jest.Mocked<LoanRepositoryPort>

  const sampleLoan = Loan.fromPersistence(1, 1, 1, new Date("2024-01-01"))

  beforeEach(() => {
    mockLoanRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue([sampleLoan]),
      findByBookId: jest.fn(),
      findByMemberId: jest.fn(),
      findActiveLoans: jest.fn(),
      findActiveLoanByBookId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<LoanRepositoryPort>

    useCase = new ListLoansUseCase(mockLoanRepository)
  })

  it("should return all loans when no filters are provided", async () => {
    const result = await useCase.execute()

    expect(mockLoanRepository.findAll).toHaveBeenCalledTimes(1)
    expect(result).toEqual([sampleLoan])
  })

  it("should filter loans by book id", async () => {
    const expectedLoans = [Loan.fromPersistence(2, 42, 10, new Date("2024-01-02"))]
    mockLoanRepository.findByBookId.mockResolvedValue(expectedLoans)

    const result = await useCase.execute({ bookId: 42 })

    expect(mockLoanRepository.findByBookId).toHaveBeenCalledWith(42)
    expect(result).toEqual(expectedLoans)
    expect(mockLoanRepository.findAll).not.toHaveBeenCalled()
  })

  it("should filter loans by member id", async () => {
    const expectedLoans = [Loan.fromPersistence(3, 10, 99, new Date("2024-01-03"))]
    mockLoanRepository.findByMemberId.mockResolvedValue(expectedLoans)

    const result = await useCase.execute({ memberId: 99 })

    expect(mockLoanRepository.findByMemberId).toHaveBeenCalledWith(99)
    expect(result).toEqual(expectedLoans)
  })

  it("should return only active loans when requested", async () => {
    const activeLoans = [Loan.fromPersistence(4, 11, 77, new Date("2024-01-04"))]
    mockLoanRepository.findActiveLoans.mockResolvedValue(activeLoans)

    const result = await useCase.execute({ activeOnly: true })

    expect(mockLoanRepository.findActiveLoans).toHaveBeenCalledTimes(1)
    expect(result).toEqual(activeLoans)
  })
})
