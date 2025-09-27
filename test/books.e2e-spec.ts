import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { describe, expect, it, beforeEach, afterAll, beforeAll } from "@jest/globals"
import { AppModule } from "@/app.module"
import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"
import { Book } from "@/modules/catalog/domain/entities/book.entity"
<<<<<<< HEAD
import { BOOK_REPOSITORY_TOKEN } from "@/modules/catalog/domain/ports/book-repository.port"
import { InMemoryBookRepository } from "@/modules/catalog/infrastructure/repositories/in-memory-book.repository"
import { MEMBER_REPOSITORY_TOKEN } from "@/modules/members/domain/ports/member-repository.port"
import { InMemoryMemberRepository } from "@/modules/members/infrastructure/repositories/in-memory-member.repository"
import { LOAN_REPOSITORY_TOKEN } from "@/modules/loans/domain/ports/loan-repository.port"
import { InMemoryLoanRepository } from "@/modules/loans/infrastructure/repositories/in-memory-loan.repository"
import { Member } from "@/modules/members/domain/entities/member.entity"
import { HASHING_SERVICE_TOKEN, type HashingPort } from "@/modules/shared/ports/hashing.port"

describe("Books (e2e)", () => {
  let app: INestApplication
  let bookRepository: InMemoryBookRepository
  let memberRepository: InMemoryMemberRepository
  let loanRepository: InMemoryLoanRepository
  let hashingService: HashingPort
  let authToken: string
  const memberPassword = "Password123!"
=======
import { type BookRepositoryPort, BOOK_REPOSITORY_TOKEN } from "@/modules/catalog/domain/ports/book-repository.port"
import { DataSource } from "typeorm"
import { LoanOrmEntity } from "@/modules/loans/infrastructure/persistence/typeorm/loan.orm-entity"
import { BookOrmEntity } from "@/modules/catalog/infrastructure/persistence/typeorm/book.orm-entity"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"

describe("Books (e2e)", () => {
  let app: INestApplication
  let bookRepository: BookRepositoryPort
  let dataSource: DataSource
>>>>>>> origin/codex/remove-prisma-ldugxq

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

    const passwordHash = await hashingService.hash(memberPassword)
    await memberRepository.save(Member.create("Test User", "user@example.com", passwordHash))

    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "user@example.com", password: memberPassword })

    expect(loginResponse.status).toBe(201)
    authToken = loginResponse.body.accessToken
    expect(authToken).toBeDefined()
=======
    await dataSource.getRepository(LoanOrmEntity).clear()
    await dataSource.getRepository(BookOrmEntity).clear()
    await dataSource.getRepository(MemberOrmEntity).clear()
>>>>>>> origin/codex/remove-prisma-ldugxq
  })

  afterAll(async () => {
    await app.close()
  })

  describe("/books (POST)", () => {
    it("should create a new book", async () => {
      const response = await request(app.getHttpServer())
        .post("/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
        })
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("id")
      expect(response.body.title).toBe("The Great Gatsby")
      expect(response.body.author).toBe("F. Scott Fitzgerald")
      expect(response.body.available).toBe(true)
    })

    it("should return 400 for invalid data", async () => {
      const response = await request(app.getHttpServer())
        .post("/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "",
          author: "F. Scott Fitzgerald",
        })

      expect(response.status).toBe(400)
    })
  })

  describe("/books (GET)", () => {
    beforeEach(async () => {
      await bookRepository.save(Book.create("Book 1", "Author 1"))
      const unavailable = await bookRepository.save(Book.create("Book 2", "Author 2"))
      unavailable.markAsUnavailable()
      await bookRepository.update(unavailable)
    })

    it("should return all books", async () => {
<<<<<<< HEAD
      const response = await request(app.getHttpServer())
        .get("/books")
        .set("Authorization", `Bearer ${authToken}`)
=======
      const response = await request(app.getHttpServer()).get("/books")
>>>>>>> origin/codex/remove-prisma-ldugxq

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty("id")
      expect(response.body[0]).toHaveProperty("title")
      expect(response.body[0]).toHaveProperty("author")
      expect(response.body[0]).toHaveProperty("available")
    })

    it("should filter books by title", async () => {
<<<<<<< HEAD
      const response = await request(app.getHttpServer())
        .get("/books?title=Book 1")
        .set("Authorization", `Bearer ${authToken}`)
=======
      const response = await request(app.getHttpServer()).get("/books?title=Book 1")
>>>>>>> origin/codex/remove-prisma-ldugxq

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe("Book 1")
    })
  })

  describe("/books/:id (PATCH)", () => {
    let bookId: number

    beforeEach(async () => {
      const book = await bookRepository.save(Book.create("Original Title", "Original Author"))
      bookId = book.id as number
    })

    it("should update a book", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/books/${bookId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          author: "Updated Author",
        })
      expect(response.status).toBe(200)
      expect(response.body.title).toBe("Updated Title")
      expect(response.body.author).toBe("Updated Author")
    })

    it("should return 404 for non-existent book", async () => {
      const response = await request(app.getHttpServer())
        .patch("/books/999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          author: "Updated Author",
        })
      expect(response.status).toBe(404)
    })
  })

  describe("/books/:id (DELETE)", () => {
    let bookId: number

    beforeEach(async () => {
      const book = await bookRepository.save(Book.create("Book to Delete", "Author"))
      bookId = book.id as number
    })

    it("should delete a book", async () => {
<<<<<<< HEAD
      const response = await request(app.getHttpServer())
        .delete(`/books/${bookId}`)
        .set("Authorization", `Bearer ${authToken}`)
=======
      const response = await request(app.getHttpServer()).delete(`/books/${bookId}`)
>>>>>>> origin/codex/remove-prisma-ldugxq

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("Book deleted successfully")
    })

    it("should return 404 for non-existent book", async () => {
<<<<<<< HEAD
      const response = await request(app.getHttpServer())
        .delete("/books/999")
        .set("Authorization", `Bearer ${authToken}`)
=======
      const response = await request(app.getHttpServer()).delete("/books/999")
>>>>>>> origin/codex/remove-prisma-ldugxq

      expect(response.status).toBe(404)
    })
  })
})
