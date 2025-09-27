import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { describe, expect, it, beforeEach, afterAll, beforeAll } from "@jest/globals"
import { DataSource } from "typeorm"

import { AppModule } from "@/app.module"
import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"
import { Book } from "@/modules/catalog/domain/entities/book.entity"
import { Loan } from "@/modules/loans/domain/entities/loan.entity"
import { type BookRepositoryPort, BOOK_REPOSITORY_TOKEN } from "@/modules/catalog/domain/ports/book-repository.port"
import { type LoanRepositoryPort, LOAN_REPOSITORY_TOKEN } from "@/modules/loans/domain/ports/loan-repository.port"
import { LoanOrmEntity } from "@/modules/loans/infrastructure/persistence/typeorm/loan.orm-entity"
import { BookOrmEntity } from "@/modules/catalog/infrastructure/persistence/typeorm/book.orm-entity"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"

describe("Loans (e2e)", () => {
  let app: INestApplication
  let bookRepository: BookRepositoryPort
  let loanRepository: LoanRepositoryPort
  let dataSource: DataSource
  let bookId: number
  let memberId: number
  let authToken: string

  const memberCredentials = {
    name: "John Doe",
    email: "john@example.com",
    password: "Password123!",
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    app.useGlobalFilters(new GlobalExceptionFilter())

    bookRepository = app.get(BOOK_REPOSITORY_TOKEN) as BookRepositoryPort
    loanRepository = app.get(LOAN_REPOSITORY_TOKEN) as LoanRepositoryPort
    dataSource = app.get(DataSource)

    await app.init()
  })

  beforeEach(async () => {
    await dataSource.getRepository(LoanOrmEntity).clear()
    await dataSource.getRepository(BookOrmEntity).clear()
    await dataSource.getRepository(MemberOrmEntity).clear()

    const book = await bookRepository.save(Book.create("Test Book", "Test Author"))
    bookId = book.id as number

    const memberResponse = await request(app.getHttpServer()).post("/members").send(memberCredentials)
    expect(memberResponse.status).toBe(201)
    memberId = Number(memberResponse.body.id)

    const loginResponse = await request(app.getHttpServer()).post("/auth/login").send({
      email: memberCredentials.email,
      password: memberCredentials.password,
    })

    expect(loginResponse.status).toBe(201)
    authToken = loginResponse.body.accessToken
    expect(authToken).toBeDefined()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("/loans (POST)", () => {
    it("should create a new loan", async () => {
      const response = await request(app.getHttpServer())
        .post("/loans")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          bookId,
          memberId,
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("id")
      expect(response.body.bookId).toBe(bookId)
      expect(response.body.memberId).toBe(memberId)
      expect(response.body.isReturned).toBe(false)
    })

    it("should return 404 for non-existent book", async () => {
      const response = await request(app.getHttpServer())
        .post("/loans")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          bookId: 999,
          memberId,
        })

      expect(response.status).toBe(404)
    })

    it("should return 404 for non-existent member", async () => {
      const response = await request(app.getHttpServer())
        .post("/loans")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          bookId,
          memberId: 999,
        })

      expect(response.status).toBe(404)
    })
  })

  describe("/loans/:id/return (POST)", () => {
    let loanId: number

    beforeEach(async () => {
      const loan = await loanRepository.save(Loan.create(bookId, memberId, new Date()))
      loanId = loan.id as number

      const savedBook = await bookRepository.findById(bookId)
      if (savedBook) {
        savedBook.markAsUnavailable()
        await bookRepository.update(savedBook)
      }
    })

    it("should return a book", async () => {
      const response = await request(app.getHttpServer())
        .post(`/loans/${loanId}/return`)
        .set("Authorization", `Bearer ${authToken}`)

      expect(response.status).toBe(201)
      expect(response.body.isReturned).toBe(true)
      expect(response.body.returnDate).toBeDefined()
    })

    it("should return 404 for non-existent loan", async () => {
      const response = await request(app.getHttpServer())
        .post("/loans/999/return")
        .set("Authorization", `Bearer ${authToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe("/loans (GET)", () => {
    beforeEach(async () => {
      await loanRepository.save(Loan.create(bookId, memberId, new Date()))
      const returned = await loanRepository.save(Loan.create(bookId, memberId, new Date()))
      returned.returnBook(new Date())
      await loanRepository.update(returned)
    })

    it("should return all loans", async () => {
      const response = await request(app.getHttpServer())
        .get("/loans")
        .set("Authorization", `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty("id")
      expect(response.body[0]).toHaveProperty("bookId")
      expect(response.body[0]).toHaveProperty("memberId")
    })

    it("should filter active loans only", async () => {
      const response = await request(app.getHttpServer())
        .get("/loans?activeOnly=true")
        .set("Authorization", `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].isReturned).toBe(false)
    })
  })
})
