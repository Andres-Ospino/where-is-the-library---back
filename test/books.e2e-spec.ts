import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { AppModule } from "@/app.module"
import { PrismaService } from "@/core/database/prisma.service"
import { describe, expect, it, beforeEach, afterAll, beforeAll } from "@jest/globals"

describe("Books (e2e)", () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))

    prisma = app.get<PrismaService>(PrismaService)

    await app.init()
  })

  beforeEach(async () => {
    // Clean database before each test
    await prisma.loan.deleteMany()
    await prisma.book.deleteMany()
    await prisma.member.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await app.close()
  })

  describe("/books (POST)", () => {
    it("should create a new book", () => {
      return request(app.getHttpServer())
        .post("/books")
        .send({
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id")
          expect(res.body.title).toBe("The Great Gatsby")
          expect(res.body.author).toBe("F. Scott Fitzgerald")
          expect(res.body.available).toBe(true)
        })
    })

    it("should return 400 for invalid data", () => {
      return request(app.getHttpServer())
        .post("/books")
        .send({
          title: "",
          author: "F. Scott Fitzgerald",
        })
        .expect(400)
    })
  })

  describe("/books (GET)", () => {
    beforeEach(async () => {
      await prisma.book.createMany({
        data: [
          { title: "Book 1", author: "Author 1", available: true },
          { title: "Book 2", author: "Author 2", available: false },
        ],
      })
    })

    it("should return all books", () => {
      return request(app.getHttpServer())
        .get("/books")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2)
          expect(res.body[0]).toHaveProperty("id")
          expect(res.body[0]).toHaveProperty("title")
          expect(res.body[0]).toHaveProperty("author")
          expect(res.body[0]).toHaveProperty("available")
        })
    })

    it("should filter books by title", () => {
      return request(app.getHttpServer())
        .get("/books?title=Book 1")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1)
          expect(res.body[0].title).toBe("Book 1")
        })
    })
  })

  describe("/books/:id (PATCH)", () => {
    let bookId: number

    beforeEach(async () => {
      const book = await prisma.book.create({
        data: { title: "Original Title", author: "Original Author", available: true },
      })
      bookId = book.id
    })

    it("should update a book", () => {
      return request(app.getHttpServer())
        .patch(`/books/${bookId}`)
        .send({
          title: "Updated Title",
          author: "Updated Author",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe("Updated Title")
          expect(res.body.author).toBe("Updated Author")
        })
    })

    it("should return 404 for non-existent book", () => {
      return request(app.getHttpServer())
        .patch("/books/999")
        .send({
          title: "Updated Title",
          author: "Updated Author",
        })
        .expect(404)
    })
  })

  describe("/books/:id (DELETE)", () => {
    let bookId: number

    beforeEach(async () => {
      const book = await prisma.book.create({
        data: { title: "Book to Delete", author: "Author", available: true },
      })
      bookId = book.id
    })

    it("should delete a book", () => {
      return request(app.getHttpServer())
        .delete(`/books/${bookId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe("Book deleted successfully")
        })
    })

    it("should return 404 for non-existent book", () => {
      return request(app.getHttpServer()).delete("/books/999").expect(404)
    })
  })
})
