import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { describe, beforeAll, beforeEach, afterAll, it, expect } from "@jest/globals"
import { DataSource } from "typeorm"

import { AppModule } from "@/app.module"
import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"

describe("Members (e2e)", () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    )
    app.useGlobalFilters(new GlobalExceptionFilter())

    dataSource = app.get(DataSource)

    await app.init()
  })

  beforeEach(async () => {
    await dataSource.getRepository(MemberOrmEntity).clear()
  })

  afterAll(async () => {
    await app.close()
  })

  it("should register a new member", async () => {
    const response = await request(app.getHttpServer()).post("/members").send({
      name: "Ada Lovelace",
      email: "ada@example.com",
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: "Ada Lovelace",
        email: "ada@example.com",
      }),
    )
  })

  it("should validate payloads and return 400 for invalid data", async () => {
    const response = await request(app.getHttpServer()).post("/members").send({
      name: "",
      email: "not-an-email",
    })

    expect(response.status).toBe(400)
  })

  it("should keep the members listing protected", async () => {
    const response = await request(app.getHttpServer()).get("/members")

    expect(response.status).toBe(401)
  })
})
