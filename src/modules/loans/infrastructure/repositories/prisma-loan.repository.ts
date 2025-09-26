import { Injectable } from "@nestjs/common"
import type { PrismaService } from "@/core/database/prisma.service"
import { Loan } from "../../domain/entities/loan.entity"
import type { LoanRepositoryPort } from "../../domain/ports/loan-repository.port"

@Injectable()
export class PrismaLoanRepository implements LoanRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(loan: Loan): Promise<Loan> {
    const data = await this.prisma.loan.create({
      data: {
        bookId: loan.bookId,
        memberId: loan.memberId,
        loanDate: loan.loanDate,
        returnDate: loan.returnDate,
      },
    })

    return Loan.fromPersistence(data.id, data.bookId, data.memberId, data.loanDate, data.returnDate || undefined)
  }

  async findById(id: number): Promise<Loan | null> {
    const data = await this.prisma.loan.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return Loan.fromPersistence(data.id, data.bookId, data.memberId, data.loanDate, data.returnDate || undefined)
  }

  async findAll(): Promise<Loan[]> {
    const data = await this.prisma.loan.findMany({
      orderBy: { loanDate: "desc" },
    })

    return data.map((loan) =>
      Loan.fromPersistence(loan.id, loan.bookId, loan.memberId, loan.loanDate, loan.returnDate || undefined),
    )
  }

  async findByBookId(bookId: number): Promise<Loan[]> {
    const data = await this.prisma.loan.findMany({
      where: { bookId },
      orderBy: { loanDate: "desc" },
    })

    return data.map((loan) =>
      Loan.fromPersistence(loan.id, loan.bookId, loan.memberId, loan.loanDate, loan.returnDate || undefined),
    )
  }

  async findByMemberId(memberId: number): Promise<Loan[]> {
    const data = await this.prisma.loan.findMany({
      where: { memberId },
      orderBy: { loanDate: "desc" },
    })

    return data.map((loan) =>
      Loan.fromPersistence(loan.id, loan.bookId, loan.memberId, loan.loanDate, loan.returnDate || undefined),
    )
  }

  async findActiveLoans(): Promise<Loan[]> {
    const data = await this.prisma.loan.findMany({
      where: { returnDate: null },
      orderBy: { loanDate: "desc" },
    })

    return data.map((loan) =>
      Loan.fromPersistence(loan.id, loan.bookId, loan.memberId, loan.loanDate, loan.returnDate || undefined),
    )
  }

  async findActiveLoanByBookId(bookId: number): Promise<Loan | null> {
    const data = await this.prisma.loan.findFirst({
      where: {
        bookId,
        returnDate: null,
      },
    })

    if (!data) {
      return null
    }

    return Loan.fromPersistence(data.id, data.bookId, data.memberId, data.loanDate, data.returnDate || undefined)
  }

  async update(loan: Loan): Promise<Loan> {
    if (!loan.id) {
      throw new Error("Cannot update loan without ID")
    }

    const data = await this.prisma.loan.update({
      where: { id: loan.id },
      data: {
        bookId: loan.bookId,
        memberId: loan.memberId,
        loanDate: loan.loanDate,
        returnDate: loan.returnDate,
      },
    })

    return Loan.fromPersistence(data.id, data.bookId, data.memberId, data.loanDate, data.returnDate || undefined)
  }

  async delete(id: number): Promise<void> {
    await this.prisma.loan.delete({
      where: { id },
    })
  }
}
