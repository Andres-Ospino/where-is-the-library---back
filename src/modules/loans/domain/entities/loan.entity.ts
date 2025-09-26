import { ValidationError } from "@/modules/shared/errors/validation.error"

export class Loan {
  constructor(
    private readonly _id: number | null,
    private readonly _bookId: number,
    private readonly _memberId: number,
    private readonly _loanDate: Date,
    private _returnDate?: Date,
  ) {
    this.validateBookId(_bookId)
    this.validateMemberId(_memberId)
    this.validateLoanDate(_loanDate)
    if (_returnDate) {
      this.validateReturnDate(_returnDate)
    }
  }

  static create(bookId: number, memberId: number, loanDate: Date): Loan {
    return new Loan(null, bookId, memberId, loanDate)
  }

  static fromPersistence(id: number, bookId: number, memberId: number, loanDate: Date, returnDate?: Date): Loan {
    return new Loan(id, bookId, memberId, loanDate, returnDate)
  }

  get id(): number | null {
    return this._id
  }

  get bookId(): number {
    return this._bookId
  }

  get memberId(): number {
    return this._memberId
  }

  get loanDate(): Date {
    return this._loanDate
  }

  get returnDate(): Date | undefined {
    return this._returnDate
  }

  get isReturned(): boolean {
    return this._returnDate !== undefined
  }

  returnBook(returnDate: Date): void {
    if (this.isReturned) {
      throw new ValidationError("Book has already been returned")
    }

    this.validateReturnDate(returnDate)
    this._returnDate = returnDate
  }

  private validateBookId(bookId: number): void {
    if (!bookId || bookId <= 0) {
      throw new ValidationError("Book ID must be a positive number")
    }
  }

  private validateMemberId(memberId: number): void {
    if (!memberId || memberId <= 0) {
      throw new ValidationError("Member ID must be a positive number")
    }
  }

  private validateLoanDate(loanDate: Date): void {
    if (!loanDate) {
      throw new ValidationError("Loan date is required")
    }
    if (loanDate > new Date()) {
      throw new ValidationError("Loan date cannot be in the future")
    }
  }

  private validateReturnDate(returnDate: Date): void {
    if (!returnDate) {
      throw new ValidationError("Return date is required")
    }
    if (returnDate < this._loanDate) {
      throw new ValidationError("Return date cannot be before loan date")
    }
  }
}
