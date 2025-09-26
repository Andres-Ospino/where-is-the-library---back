import type { Loan } from "../entities/loan.entity"

export const LOAN_REPOSITORY_TOKEN = Symbol("LoanRepository")

export interface LoanRepositoryPort {
  save(loan: Loan): Promise<Loan>
  findById(id: number): Promise<Loan | null>
  findAll(): Promise<Loan[]>
  findByBookId(bookId: number): Promise<Loan[]>
  findByMemberId(memberId: number): Promise<Loan[]>
  findActiveLoans(): Promise<Loan[]>
  findActiveLoanByBookId(bookId: number): Promise<Loan | null>
  update(loan: Loan): Promise<Loan>
  delete(id: number): Promise<void>
}
