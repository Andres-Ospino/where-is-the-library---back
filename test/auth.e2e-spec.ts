import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { describe, beforeAll, beforeEach, afterAll, it, expect } from "@jest/globals"
import { DataSource } from "typeorm"

import { AppModule } from "@/app.module"
import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"

describe("Auth (e2e)", () => {
  let app: INestApplication
  let dataSource: DataSource

  const memberPayload = {
    name: "Alan Turing",
    email: "alan@example.com",
    password: "StrongPass123",
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    app.useGlobalFilters(new GlobalExceptionFilter())

    dataSource = app.get(DataSource)

    await app.init()
  })

  beforeEach(async () => {
    await dataSource.getRepository(MemberOrmEntity).clear()
    const response = await request(app.getHttpServer()).post("/members").send(memberPayload)
    expect(response.status).toBe(201)
  })

  afterAll(async () => {
    await app.close()
  })

  it("should reject invalid login credentials", async () => {
    const response = await request(app.getHttpServer()).post("/auth/login").send({
      email: memberPayload.email,
      password: "WrongPassword",
    })

    expect(response.status).toBe(401)
  })
})
