import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { describe, beforeAll, beforeEach, afterAll, it, expect } from "@jest/globals"
import { DataSource } from "typeorm"

import { AppModule } from "@/app.module"
import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"
import { AuthAccountOrmEntity } from "@/modules/auth-accounts/infrastructure/persistence/typeorm/auth-account.orm-entity"
import { AUTH_ACCOUNT_REPOSITORY_TOKEN, type AuthAccountRepositoryPort } from "@/modules/auth-accounts/domain/ports/auth-account-repository.port"
import { AuthAccount } from "@/modules/auth-accounts/domain/entities/auth-account.entity"
import { HASHING_SERVICE_TOKEN, type HashingPort } from "@/modules/shared/ports/hashing.port"

describe("Auth (e2e)", () => {
  let app: INestApplication
  let dataSource: DataSource
  let authAccountRepository: AuthAccountRepositoryPort
  let hashingService: HashingPort

  const memberPayload = {
    name: "Alan Turing",
    email: "alan@example.com",
  }
  const memberPassword = "StrongPass123"

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    app.useGlobalFilters(new GlobalExceptionFilter())

    dataSource = app.get(DataSource)
    authAccountRepository = app.get(AUTH_ACCOUNT_REPOSITORY_TOKEN) as AuthAccountRepositoryPort
    hashingService = app.get(HASHING_SERVICE_TOKEN) as HashingPort

    await app.init()
  })

  beforeEach(async () => {
    await dataSource.getRepository(AuthAccountOrmEntity).clear()
    await dataSource.getRepository(MemberOrmEntity).clear()
    const response = await request(app.getHttpServer())
      .post("/members")
      .send({ name: memberPayload.name, email: memberPayload.email })
    expect(response.status).toBe(201)

    const passwordHash = await hashingService.hash(memberPassword)
    await authAccountRepository.save(AuthAccount.create(memberPayload.email, passwordHash))
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
