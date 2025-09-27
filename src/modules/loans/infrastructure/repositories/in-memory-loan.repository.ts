import { Injectable } from "@nestjs/common"
import { Loan } from "../../domain/entities/loan.entity"
import type { LoanRepositoryPort } from "../../domain/ports/loan-repository.port"

interface LoanRecord {
  id: number
  bookId: number
  memberId: number
  loanDate: Date
  returnDate?: Date
}

@Injectable()
export class InMemoryLoanRepository implements LoanRepositoryPort {
  private loans: LoanRecord[] = []
  private nextId = 1

  async save(loan: Loan): Promise<Loan> {
    const record: LoanRecord = {
      id: this.nextId++,
      bookId: loan.bookId,
      memberId: loan.memberId,
      loanDate: new Date(loan.loanDate.getTime()),
      returnDate: loan.returnDate ? new Date(loan.returnDate.getTime()) : undefined,
    }

    this.loans.push(record)

    return Loan.fromPersistence(record.id, record.bookId, record.memberId, record.loanDate, record.returnDate)
  }

  async findById(id: number): Promise<Loan | null> {
    const record = this.loans.find((loan) => loan.id === id)
    if (!record) {
      return null
    }

    return Loan.fromPersistence(record.id, record.bookId, record.memberId, record.loanDate, record.returnDate)
  }

  async findAll(): Promise<Loan[]> {
    return this.loans
      .slice()
      .sort((a, b) => b.loanDate.getTime() - a.loanDate.getTime())
      .map((record) => Loan.fromPersistence(record.id, record.bookId, record.memberId, record.loanDate, record.returnDate))
  }

  async findByBookId(bookId: number): Promise<Loan[]> {
    return this.loans
      .filter((loan) => loan.bookId === bookId)
      .sort((a, b) => b.loanDate.getTime() - a.loanDate.getTime())
      .map((record) => Loan.fromPersistence(record.id, record.bookId, record.memberId, record.loanDate, record.returnDate))
  }

  async findByMemberId(memberId: number): Promise<Loan[]> {
    return this.loans
      .filter((loan) => loan.memberId === memberId)
      .sort((a, b) => b.loanDate.getTime() - a.loanDate.getTime())
      .map((record) => Loan.fromPersistence(record.id, record.bookId, record.memberId, record.loanDate, record.returnDate))
  }

  async findActiveLoans(): Promise<Loan[]> {
    return this.loans
      .filter((loan) => loan.returnDate === undefined)
      .sort((a, b) => b.loanDate.getTime() - a.loanDate.getTime())
      .map((record) => Loan.fromPersistence(record.id, record.bookId, record.memberId, record.loanDate, record.returnDate))
  }

  async findActiveLoanByBookId(bookId: number): Promise<Loan | null> {
    const record = this.loans.find((loan) => loan.bookId === bookId && loan.returnDate === undefined)
    if (!record) {
      return null
    }

    return Loan.fromPersistence(record.id, record.bookId, record.memberId, record.loanDate, record.returnDate)
  }

  async update(loan: Loan): Promise<Loan> {
    const id = loan.id
    if (!id) {
      throw new Error("Cannot update loan without ID")
    }

    const index = this.loans.findIndex((record) => record.id === id)
    if (index === -1) {
      throw new Error(`Loan with ID ${id} not found`)
    }

    const updated: LoanRecord = {
      id,
      bookId: loan.bookId,
      memberId: loan.memberId,
      loanDate: new Date(loan.loanDate.getTime()),
      returnDate: loan.returnDate ? new Date(loan.returnDate.getTime()) : undefined,
    }

    this.loans[index] = updated

    return Loan.fromPersistence(updated.id, updated.bookId, updated.memberId, updated.loanDate, updated.returnDate)
  }

  async delete(id: number): Promise<void> {
    this.loans = this.loans.filter((loan) => loan.id !== id)
  }

  clear(): void {
    this.loans = []
    this.nextId = 1
  }
}
