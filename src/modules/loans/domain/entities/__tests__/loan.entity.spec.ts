import { Loan } from "../loan.entity"
import { ValidationError } from "@/modules/shared/errors/validation.error"

describe("Loan entity", () => {
  it("should create a loan with valid data", () => {
    const loanDate = new Date("2024-01-01T10:00:00Z")
    const loan = Loan.create(1, 2, loanDate)

    expect(loan.id).toBeNull()
    expect(loan.bookId).toBe(1)
    expect(loan.memberId).toBe(2)
    expect(loan.loanDate).toEqual(loanDate)
    expect(loan.isReturned).toBe(false)
  })

  it("should throw when book id is not positive", () => {
    expect(() => Loan.create(0, 1, new Date("2024-01-01"))).toThrow(ValidationError)
    expect(() => Loan.create(-5, 1, new Date("2024-01-01"))).toThrow(ValidationError)
  })

  it("should throw when member id is not positive", () => {
    expect(() => Loan.create(1, 0, new Date("2024-01-01"))).toThrow(ValidationError)
    expect(() => Loan.create(1, -10, new Date("2024-01-01"))).toThrow(ValidationError)
  })

  it("should throw when loan date is in the future", () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000)
    expect(() => Loan.create(1, 2, futureDate)).toThrow(ValidationError)
  })

  it("should set return date when returning a book", () => {
    const loan = Loan.create(1, 2, new Date("2024-01-01T10:00:00Z"))
    const returnDate = new Date("2024-01-05T10:00:00Z")

    loan.returnBook(returnDate)

    expect(loan.isReturned).toBe(true)
    expect(loan.returnDate).toEqual(returnDate)
  })

  it("should not allow returning before loan date", () => {
    const loan = Loan.create(1, 2, new Date("2024-01-05T10:00:00Z"))
    const invalidReturnDate = new Date("2024-01-04T10:00:00Z")

    expect(() => loan.returnBook(invalidReturnDate)).toThrow(ValidationError)
  })

  it("should not allow returning a loan twice", () => {
    const loan = Loan.create(1, 2, new Date("2024-01-01T10:00:00Z"))
    const returnDate = new Date("2024-01-05T10:00:00Z")

    loan.returnBook(returnDate)

    expect(() => loan.returnBook(returnDate)).toThrow(ValidationError)
  })

  it("should validate persisted return date", () => {
    expect(() =>
      Loan.fromPersistence(1, 1, 2, new Date("2024-01-05T10:00:00Z"), new Date("2024-01-01T10:00:00Z")),
    ).toThrow(ValidationError)
  })

  it("should require a loan date", () => {
    expect(() => Loan.create(1, 2, undefined as unknown as Date)).toThrow(ValidationError)
  })
})
