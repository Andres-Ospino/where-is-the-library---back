import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { describe, beforeAll, beforeEach, afterAll, it, expect } from "@jest/globals"
import { DataSource } from "typeorm"

import { AppModule } from "@/app.module"
import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"
import { AuthAccountOrmEntity } from "@/modules/auth-accounts/infrastructure/persistence/typeorm/auth-account.orm-entity"
import {
  AUTH_ACCOUNT_REPOSITORY_TOKEN,
  type AuthAccountRepositoryPort,
} from "@/modules/auth-accounts/domain/ports/auth-account-repository.port"
import { AuthAccount } from "@/modules/auth-accounts/domain/entities/auth-account.entity"
import { HASHING_SERVICE_TOKEN, type HashingPort } from "@/modules/shared/ports/hashing.port"

describe("Members (e2e)", () => {
  let app: INestApplication
  let dataSource: DataSource
  let authAccountRepository: AuthAccountRepositoryPort
  let hashingService: HashingPort

  const memberPassword = "StrongPass123"

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
    authAccountRepository = app.get(AUTH_ACCOUNT_REPOSITORY_TOKEN) as AuthAccountRepositoryPort
    hashingService = app.get(HASHING_SERVICE_TOKEN) as HashingPort

    await app.init()
  })

  beforeEach(async () => {
    await dataSource.getRepository(MemberOrmEntity).clear()
    await dataSource.getRepository(AuthAccountOrmEntity).clear()
  })

  afterAll(async () => {
    await app.close()
  })

  const createMemberPayload = (suffix: string) => ({
    name: `Member ${suffix}`,
    email: `member-${suffix}@example.com`,
    phone: `+34600${suffix.padStart(6, "0")}`,
  })

  const createMemberAndAuthenticate = async () => {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-6)
    const payload = createMemberPayload(suffix)

    const response = await request(app.getHttpServer()).post("/members").send(payload)
    expect(response.status).toBe(201)

    const passwordHash = await hashingService.hash(memberPassword)
    await authAccountRepository.save(AuthAccount.create(payload.email, passwordHash))

    const loginResponse = await request(app.getHttpServer()).post("/auth/login").send({
      email: payload.email,
      password: memberPassword,
    })

    expect(loginResponse.status).toBe(201)

    return { memberId: response.body.id as number, accessToken: loginResponse.body.accessToken as string, payload }
  }

  it("should register a new member", async () => {
    const response = await request(app.getHttpServer()).post("/members").send({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+44123456789",
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: "Ada Lovelace",
        email: "ada@example.com",
        phone: "+44123456789",
      }),
    )
  })

  it("should validate payloads and return 400 for invalid data", async () => {
    const response = await request(app.getHttpServer()).post("/members").send({
      name: "",
      email: "not-an-email",
      phone: "123",
    })

    expect(response.status).toBe(400)
  })

  it("should keep the members listing protected", async () => {
    const response = await request(app.getHttpServer()).get("/members")

    expect(response.status).toBe(401)
  })

  it("should update an existing member", async () => {
    const { memberId, accessToken, payload } = await createMemberAndAuthenticate()

    const response = await request(app.getHttpServer())
      .patch(`/members/${memberId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: `${payload.name} Updated`, phone: "+34900111222" })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: memberId,
        name: `${payload.name} Updated`,
        email: payload.email,
        phone: "+34900111222",
      }),
    )
  })

  it("should return 404 when trying to update a non-existent member", async () => {
    const { accessToken } = await createMemberAndAuthenticate()

    const response = await request(app.getHttpServer())
      .patch("/members/999")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Ghost Member", phone: "+34900999888" })

    expect(response.status).toBe(404)
  })

  it("should delete an existing member", async () => {
    const { memberId, accessToken } = await createMemberAndAuthenticate()

    const response = await request(app.getHttpServer())
      .delete(`/members/${memberId}`)
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.status).toBe(204)

    const secondAttempt = await request(app.getHttpServer())
      .delete(`/members/${memberId}`)
      .set("Authorization", `Bearer ${accessToken}`)

    expect(secondAttempt.status).toBe(404)
  })

  it("should return 404 when deleting a non-existent member", async () => {
    const { accessToken } = await createMemberAndAuthenticate()

    const response = await request(app.getHttpServer())
      .delete("/members/999")
      .set("Authorization", `Bearer ${accessToken}`)

    expect(response.status).toBe(404)
  })
})
