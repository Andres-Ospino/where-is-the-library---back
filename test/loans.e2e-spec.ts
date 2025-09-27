import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { AppModule } from "@/app.module"
import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"
import { Book } from "@/modules/catalog/domain/entities/book.entity"
import { Member } from "@/modules/members/domain/entities/member.entity"
import { Loan } from "@/modules/loans/domain/entities/loan.entity"
<<<<<<< HEAD
import { BOOK_REPOSITORY_TOKEN } from "@/modules/catalog/domain/ports/book-repository.port"
import { InMemoryBookRepository } from "@/modules/catalog/infrastructure/repositories/in-memory-book.repository"
import { MEMBER_REPOSITORY_TOKEN } from "@/modules/members/domain/ports/member-repository.port"
import { InMemoryMemberRepository } from "@/modules/members/infrastructure/repositories/in-memory-member.repository"
import { LOAN_REPOSITORY_TOKEN } from "@/modules/loans/domain/ports/loan-repository.port"
import { InMemoryLoanRepository } from "@/modules/loans/infrastructure/repositories/in-memory-loan.repository"
import { HASHING_SERVICE_TOKEN, type HashingPort } from "@/modules/shared/ports/hashing.port"

describe("Loans (e2e)", () => {
  let app: INestApplication
  let bookRepository: InMemoryBookRepository
  let memberRepository: InMemoryMemberRepository
  let loanRepository: InMemoryLoanRepository
=======
import { type BookRepositoryPort, BOOK_REPOSITORY_TOKEN } from "@/modules/catalog/domain/ports/book-repository.port"
import { type MemberRepositoryPort, MEMBER_REPOSITORY_TOKEN } from "@/modules/members/domain/ports/member-repository.port"
import { type LoanRepositoryPort, LOAN_REPOSITORY_TOKEN } from "@/modules/loans/domain/ports/loan-repository.port"
import { DataSource } from "typeorm"
import { LoanOrmEntity } from "@/modules/loans/infrastructure/persistence/typeorm/loan.orm-entity"
import { BookOrmEntity } from "@/modules/catalog/infrastructure/persistence/typeorm/book.orm-entity"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"

describe("Loans (e2e)", () => {
  let app: INestApplication
  let bookRepository: BookRepositoryPort
  let memberRepository: MemberRepositoryPort
  let loanRepository: LoanRepositoryPort
  let dataSource: DataSource
>>>>>>> origin/codex/remove-prisma-ldugxq
  let bookId: number
  let memberId: number
  let hashingService: HashingPort
  let authToken: string
  const memberPassword = "Password123!"

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    app.useGlobalFilters(new GlobalExceptionFilter())

<<<<<<< HEAD
    bookRepository = app.get(BOOK_REPOSITORY_TOKEN) as InMemoryBookRepository
    memberRepository = app.get(MEMBER_REPOSITORY_TOKEN) as InMemoryMemberRepository
    loanRepository = app.get(LOAN_REPOSITORY_TOKEN) as InMemoryLoanRepository
=======
    bookRepository = app.get(BOOK_REPOSITORY_TOKEN) as BookRepositoryPort
    memberRepository = app.get(MEMBER_REPOSITORY_TOKEN) as MemberRepositoryPort
    loanRepository = app.get(LOAN_REPOSITORY_TOKEN) as LoanRepositoryPort
    dataSource = app.get(DataSource)
>>>>>>> origin/codex/remove-prisma-ldugxq

    await app.init()

    hashingService = app.get(HASHING_SERVICE_TOKEN) as HashingPort
  })

  beforeEach(async () => {
<<<<<<< HEAD
    loanRepository.clear()
    bookRepository.clear()
    memberRepository.clear()
=======
    await dataSource.getRepository(LoanOrmEntity).clear()
    await dataSource.getRepository(BookOrmEntity).clear()
    await dataSource.getRepository(MemberOrmEntity).clear()
>>>>>>> origin/codex/remove-prisma-ldugxq

    const book = await bookRepository.save(Book.create("Test Book", "Test Author"))
    bookId = book.id as number

<<<<<<< HEAD
    const passwordHash = await hashingService.hash(memberPassword)
    const member = await memberRepository.save(Member.create("John Doe", "john@example.com", passwordHash))
    memberId = member.id as number

    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "john@example.com", password: memberPassword })

    expect(loginResponse.status).toBe(201)
    authToken = loginResponse.body.accessToken
    expect(authToken).toBeDefined()
=======
    const member = await memberRepository.save(Member.create("John Doe", "john@example.com"))
    memberId = member.id as number
>>>>>>> origin/codex/remove-prisma-ldugxq
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
<<<<<<< HEAD
      const response = await request(app.getHttpServer())
        .post(`/loans/${loanId}/return`)
        .set("Authorization", `Bearer ${authToken}`)
=======
      const response = await request(app.getHttpServer()).post(`/loans/${loanId}/return`)
>>>>>>> origin/codex/remove-prisma-ldugxq

      expect(response.status).toBe(201)
      expect(response.body.isReturned).toBe(true)
      expect(response.body.returnDate).toBeDefined()
    })

    it("should return 404 for non-existent loan", async () => {
<<<<<<< HEAD
      const response = await request(app.getHttpServer())
        .post("/loans/999/return")
        .set("Authorization", `Bearer ${authToken}`)
=======
      const response = await request(app.getHttpServer()).post("/loans/999/return")
>>>>>>> origin/codex/remove-prisma-ldugxq

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
<<<<<<< HEAD
      const response = await request(app.getHttpServer())
        .get("/loans")
        .set("Authorization", `Bearer ${authToken}`)
=======
      const response = await request(app.getHttpServer()).get("/loans")
>>>>>>> origin/codex/remove-prisma-ldugxq
      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty("id")
      expect(response.body[0]).toHaveProperty("bookId")
      expect(response.body[0]).toHaveProperty("memberId")
    })

    it("should filter active loans only", async () => {
<<<<<<< HEAD
      const response = await request(app.getHttpServer())
        .get("/loans?activeOnly=true")
        .set("Authorization", `Bearer ${authToken}`)
=======
      const response = await request(app.getHttpServer()).get("/loans?activeOnly=true")
>>>>>>> origin/codex/remove-prisma-ldugxq
      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].isReturned).toBe(false)
    })
  })
})
