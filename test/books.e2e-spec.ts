import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { describe, expect, it, beforeEach, afterAll, beforeAll } from "@jest/globals"
import { AppModule } from "@/app.module"
import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"
import { Book } from "@/modules/catalog/domain/entities/book.entity"
import { type BookRepositoryPort, BOOK_REPOSITORY_TOKEN } from "@/modules/catalog/domain/ports/book-repository.port"
import { DataSource } from "typeorm"
import { LoanOrmEntity } from "@/modules/loans/infrastructure/persistence/typeorm/loan.orm-entity"
import { BookOrmEntity } from "@/modules/catalog/infrastructure/persistence/typeorm/book.orm-entity"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"

describe("Books (e2e)", () => {
  let app: INestApplication
  let bookRepository: BookRepositoryPort
  let dataSource: DataSource

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    app.useGlobalFilters(new GlobalExceptionFilter())

    bookRepository = app.get(BOOK_REPOSITORY_TOKEN) as BookRepositoryPort
    dataSource = app.get(DataSource)

    await app.init()
  })

  beforeEach(async () => {
    await dataSource.getRepository(LoanOrmEntity).clear()
    await dataSource.getRepository(BookOrmEntity).clear()
    await dataSource.getRepository(MemberOrmEntity).clear()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("/books (POST)", () => {
    it("should create a new book", async () => {
      const response = await request(app.getHttpServer())
        .post("/books")
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
      const response = await request(app.getHttpServer()).get("/books")

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty("id")
      expect(response.body[0]).toHaveProperty("title")
      expect(response.body[0]).toHaveProperty("author")
      expect(response.body[0]).toHaveProperty("available")
    })

    it("should filter books by title", async () => {
      const response = await request(app.getHttpServer()).get("/books?title=Book 1")

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
      const response = await request(app.getHttpServer()).delete(`/books/${bookId}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe("Book deleted successfully")
    })

    it("should return 404 for non-existent book", async () => {
      const response = await request(app.getHttpServer()).delete("/books/999")

      expect(response.status).toBe(404)
    })
  })
})
