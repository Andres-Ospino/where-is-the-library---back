import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { AppModule } from "@/app.module"
import { PrismaService } from "@/core/database/prisma.service"

describe("Loans (e2e)", () => {
  let app: INestApplication
  let prisma: PrismaService
  let bookId: number
  let memberId: number

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

    // Create test data
    const book = await prisma.book.create({
      data: { title: "Test Book", author: "Test Author", available: true },
    })
    bookId = book.id

    const member = await prisma.member.create({
      data: { name: "John Doe", email: "john@example.com" },
    })
    memberId = member.id
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await app.close()
  })

  describe("/loans (POST)", () => {
    it("should create a new loan", () => {
      return request(app.getHttpServer())
        .post("/loans")
        .send({
          bookId,
          memberId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id")
          expect(res.body.bookId).toBe(bookId)
          expect(res.body.memberId).toBe(memberId)
          expect(res.body.isReturned).toBe(false)
        })
    })

    it("should return 404 for non-existent book", () => {
      return request(app.getHttpServer())
        .post("/loans")
        .send({
          bookId: 999,
          memberId,
        })
        .expect(404)
    })

    it("should return 404 for non-existent member", () => {
      return request(app.getHttpServer())
        .post("/loans")
        .send({
          bookId,
          memberId: 999,
        })
        .expect(404)
    })
  })

  describe("/loans/:id/return (POST)", () => {
    let loanId: number

    beforeEach(async () => {
      const loan = await prisma.loan.create({
        data: {
          bookId,
          memberId,
          loanDate: new Date(),
        },
      })
      loanId = loan.id

      // Mark book as unavailable
      await prisma.book.update({
        where: { id: bookId },
        data: { available: false },
      })
    })

    it("should return a book", () => {
      return request(app.getHttpServer())
        .post(`/loans/${loanId}/return`)
        .expect(201)
        .expect((res) => {
          expect(res.body.isReturned).toBe(true)
          expect(res.body.returnDate).toBeDefined()
        })
    })

    it("should return 404 for non-existent loan", () => {
      return request(app.getHttpServer()).post("/loans/999/return").expect(404)
    })
  })

  describe("/loans (GET)", () => {
    beforeEach(async () => {
      await prisma.loan.createMany({
        data: [
          { bookId, memberId, loanDate: new Date() },
          { bookId, memberId, loanDate: new Date(), returnDate: new Date() },
        ],
      })
    })

    it("should return all loans", () => {
      return request(app.getHttpServer())
        .get("/loans")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2)
          expect(res.body[0]).toHaveProperty("id")
          expect(res.body[0]).toHaveProperty("bookId")
          expect(res.body[0]).toHaveProperty("memberId")
        })
    })

    it("should filter active loans only", () => {
      return request(app.getHttpServer())
        .get("/loans?activeOnly=true")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1)
          expect(res.body[0].isReturned).toBe(false)
        })
    })
  })
})
