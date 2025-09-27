import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { IsNull, Repository } from "typeorm"
import { Loan } from "../../domain/entities/loan.entity"
import type { LoanRepositoryPort } from "../../domain/ports/loan-repository.port"
import { LoanOrmEntity } from "../persistence/typeorm/loan.orm-entity"

@Injectable()
export class TypeormLoanRepository implements LoanRepositoryPort {
  constructor(
    @InjectRepository(LoanOrmEntity)
    private readonly repository: Repository<LoanOrmEntity>,
  ) {}

  private toDomain(entity: LoanOrmEntity): Loan {
    return Loan.fromPersistence(entity.id, entity.bookId, entity.memberId, entity.loanDate, entity.returnDate ?? undefined)
  }

  async save(loan: Loan): Promise<Loan> {
    const entity = this.repository.create({
      bookId: loan.bookId,
      memberId: loan.memberId,
      loanDate: loan.loanDate,
      returnDate: loan.returnDate ?? undefined,
    })

    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async findById(id: number): Promise<Loan | null> {
    const entity = await this.repository.findOne({ where: { id } })
    return entity ? this.toDomain(entity) : null
  }

  async findAll(): Promise<Loan[]> {
    const entities = await this.repository.find({ order: { loanDate: "DESC" } })
    return entities.map((entity) => this.toDomain(entity))
  }

  async findByBookId(bookId: number): Promise<Loan[]> {
    const entities = await this.repository.find({
      where: { bookId },
      order: { loanDate: "DESC" },
    })

    return entities.map((entity) => this.toDomain(entity))
  }

  async findByMemberId(memberId: number): Promise<Loan[]> {
    const entities = await this.repository.find({
      where: { memberId },
      order: { loanDate: "DESC" },
    })

    return entities.map((entity) => this.toDomain(entity))
  }

  async findActiveLoans(): Promise<Loan[]> {
    const entities = await this.repository.find({
      where: { returnDate: IsNull() },
      order: { loanDate: "DESC" },
    })

    return entities.map((entity) => this.toDomain(entity))
  }

  async findActiveLoanByBookId(bookId: number): Promise<Loan | null> {
    const entity = await this.repository.findOne({
      where: { bookId, returnDate: IsNull() },
      order: { loanDate: "DESC" },
    })

    return entity ? this.toDomain(entity) : null
  }

  async update(loan: Loan): Promise<Loan> {
    const id = loan.id
    if (!id) {
      throw new Error("Cannot update loan without ID")
    }

    const entity = await this.repository.preload({
      id,
      bookId: loan.bookId,
      memberId: loan.memberId,
      loanDate: loan.loanDate,
      returnDate: loan.returnDate ?? undefined,
    })

    if (!entity) {
      throw new Error(`Loan with ID ${id} not found`)
    }

    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id })
  }
}
