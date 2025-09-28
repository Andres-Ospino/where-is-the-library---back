import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { describe, expect, it, beforeEach, afterAll, beforeAll } from "@jest/globals"
import { DataSource } from "typeorm"

import { AppModule } from "@/app.module"
import { GlobalExceptionFilter } from "@/core/filters/global-exception.filter"
import { Library } from "@/modules/libraries/domain/entities/library.entity"
import { type LibraryRepositoryPort, LIBRARY_REPOSITORY_TOKEN } from "@/modules/libraries/domain/ports/library-repository.port"
import { LibraryOrmEntity } from "@/modules/libraries/infrastructure/persistence/typeorm/library.orm-entity"
import { LoanOrmEntity } from "@/modules/loans/infrastructure/persistence/typeorm/loan.orm-entity"
import { BookOrmEntity } from "@/modules/catalog/infrastructure/persistence/typeorm/book.orm-entity"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"
import { AuthAccountOrmEntity } from "@/modules/auth-accounts/infrastructure/persistence/typeorm/auth-account.orm-entity"
import {
  AUTH_ACCOUNT_REPOSITORY_TOKEN,
  type AuthAccountRepositoryPort,
} from "@/modules/auth-accounts/domain/ports/auth-account-repository.port"
import { AuthAccount } from "@/modules/auth-accounts/domain/entities/auth-account.entity"
import { HASHING_SERVICE_TOKEN, type HashingPort } from "@/modules/shared/ports/hashing.port"

describe("Libraries (e2e)", () => {
  let app: INestApplication
  let libraryRepository: LibraryRepositoryPort
  let dataSource: DataSource
  let authToken: string
  let authAccountRepository: AuthAccountRepositoryPort
  let hashingService: HashingPort

  const memberCredentials = {
    name: "Test User",
    email: "user@example.com",
    phone: "+34987654321",
    password: "Password123!",
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    app.useGlobalFilters(new GlobalExceptionFilter())

    libraryRepository = app.get(LIBRARY_REPOSITORY_TOKEN) as LibraryRepositoryPort
    dataSource = app.get(DataSource)
    authAccountRepository = app.get(AUTH_ACCOUNT_REPOSITORY_TOKEN) as AuthAccountRepositoryPort
    hashingService = app.get(HASHING_SERVICE_TOKEN) as HashingPort

    await app.init()
  })

  beforeEach(async () => {
    await dataSource.getRepository(LoanOrmEntity).clear()
    await dataSource.getRepository(BookOrmEntity).clear()
    await dataSource.getRepository(LibraryOrmEntity).clear()
    await dataSource.getRepository(MemberOrmEntity).clear()
    await dataSource.getRepository(AuthAccountOrmEntity).clear()

    const memberResponse = await request(app.getHttpServer())
      .post("/members")
      .send({
        name: memberCredentials.name,
        email: memberCredentials.email,
        phone: memberCredentials.phone,
      })
    expect(memberResponse.status).toBe(201)

    const passwordHash = await hashingService.hash(memberCredentials.password)
    await authAccountRepository.save(AuthAccount.create(memberCredentials.email, passwordHash))

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

  describe("/libraries (POST)", () => {
    it("should create a new library", async () => {
      const response = await request(app.getHttpServer())
        .post("/libraries")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Biblioteca Central",
          address: "Av. Siempre Viva 123",
          openingHours: "Lunes a Viernes 09:00-18:00",
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("id")
      expect(response.body.name).toBe("Biblioteca Central")
      expect(response.body.address).toBe("Av. Siempre Viva 123")
      expect(response.body.openingHours).toBe("Lunes a Viernes 09:00-18:00")
      expect(Array.isArray(response.body.books)).toBe(true)
      expect(response.body.books).toHaveLength(0)
    })

    it("should return 400 for invalid data", async () => {
      const response = await request(app.getHttpServer())
        .post("/libraries")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "",
          address: "Av. Siempre Viva 123",
          openingHours: "Lunes a Viernes 09:00-18:00",
        })

      expect(response.status).toBe(400)
    })
  })

  describe("/libraries (GET)", () => {
    beforeEach(async () => {
      const central = await libraryRepository.save(
        Library.create("Biblioteca Central", "Av. Siempre Viva 123", "Lunes a Viernes 09:00-18:00"),
      )
      const barrio = await libraryRepository.save(
        Library.create("Biblioteca Barrio", "Calle Falsa 456", "Martes a Domingo 10:00-16:00"),
      )

      await dataSource.getRepository(BookOrmEntity).save({
        title: "El Quijote",
        author: "Miguel de Cervantes",
        isbn: "9783161484100",
        available: true,
        libraryId: barrio.id ?? undefined,
      })

      await dataSource.getRepository(BookOrmEntity).save({
        title: "Cien años de soledad",
        author: "Gabriel García Márquez",
        isbn: "9780307474728",
        available: true,
        libraryId: central.id ?? undefined,
      })
    })

    it("should return all libraries", async () => {
      const response = await request(app.getHttpServer())
        .get("/libraries")
        .set("Authorization", `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      const barrioLibrary = response.body.find((item: any) => item.name === "Biblioteca Barrio")
      const centralLibrary = response.body.find((item: any) => item.name === "Biblioteca Central")

      expect(barrioLibrary).toBeDefined()
      expect(centralLibrary).toBeDefined()
      expect(barrioLibrary.books).toHaveLength(1)
      expect(barrioLibrary.books[0].title).toBe("El Quijote")
      expect(centralLibrary.books).toHaveLength(1)
      expect(centralLibrary.books[0].title).toBe("Cien años de soledad")
    })
  })

  describe("/libraries/:id (GET)", () => {
    let libraryId: number

    beforeEach(async () => {
      const library = await libraryRepository.save(
        Library.create("Biblioteca Central", "Av. Siempre Viva 123", "Lunes a Viernes 09:00-18:00"),
      )
      libraryId = library.id as number

      await dataSource.getRepository(BookOrmEntity).save({
        title: "Rayuela",
        author: "Julio Cortázar",
        isbn: "9780679737553",
        available: true,
        libraryId,
      })
    })

    it("should return a library by id", async () => {
      const response = await request(app.getHttpServer())
        .get(`/libraries/${libraryId}`)
        .set("Authorization", `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(libraryId)
      expect(response.body.books).toHaveLength(1)
      expect(response.body.books[0].title).toBe("Rayuela")
    })

    it("should return 404 for non-existent library", async () => {
      const response = await request(app.getHttpServer())
        .get("/libraries/999")
        .set("Authorization", `Bearer ${authToken}`)

      expect(response.status).toBe(404)
    })
  })
})
