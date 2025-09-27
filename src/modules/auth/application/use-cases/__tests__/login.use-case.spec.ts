import { LoginUseCase } from "../login.use-case"
import { AuthAccount } from "@/modules/auth-accounts/domain/entities/auth-account.entity"
import type { AuthAccountRepositoryPort } from "@/modules/auth-accounts/domain/ports/auth-account-repository.port"
import { Member } from "@/modules/members/domain/entities/member.entity"
import { FindMemberByEmailUseCase } from "@/modules/members/application/use-cases/find-member-by-email.use-case"
import type { HashingPort } from "@/modules/shared/ports/hashing.port"
import { JwtService } from "@nestjs/jwt"
import { UnauthorizedException } from "@nestjs/common"

describe("LoginUseCase", () => {
  let useCase: LoginUseCase
  let mockAuthAccountRepository: jest.Mocked<AuthAccountRepositoryPort>
  let mockHashingService: jest.Mocked<HashingPort>
  let mockJwtService: jest.Mocked<JwtService>
  let mockFindMemberByEmailUseCase: jest.Mocked<FindMemberByEmailUseCase>
  let dateNowSpy: jest.SpyInstance<number, []>

  const command = {
    email: "ada@example.com",
    password: "Password123!",
  }

  const nowInSeconds = 1_700_000_000

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(nowInSeconds * 1000)

    mockAuthAccountRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<AuthAccountRepositoryPort>

    mockHashingService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as jest.Mocked<HashingPort>

    mockJwtService = {
      signAsync: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    } as unknown as jest.Mocked<JwtService>

    mockFindMemberByEmailUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FindMemberByEmailUseCase>

    useCase = new LoginUseCase(
      mockAuthAccountRepository,
      mockJwtService,
      mockHashingService,
      mockFindMemberByEmailUseCase,
    )
  })

  afterEach(() => {
    dateNowSpy.mockRestore()
  })

  it("should authenticate a member with valid credentials", async () => {
    const authAccount = AuthAccount.fromPersistence(1, command.email, "hashed")
    mockAuthAccountRepository.findByEmail.mockResolvedValue(authAccount)
    mockHashingService.compare.mockResolvedValue(true)
    mockJwtService.signAsync.mockResolvedValue("signed-token")
    mockJwtService.decode.mockReturnValue({ exp: nowInSeconds + 3600 })
    const member = Member.fromPersistence(1, "Ada Lovelace", command.email)
    mockFindMemberByEmailUseCase.execute.mockResolvedValue(member)

    const result = await useCase.execute(command)

    expect(mockAuthAccountRepository.findByEmail).toHaveBeenCalledWith(command.email)
    expect(mockHashingService.compare).toHaveBeenCalledWith(command.password, authAccount.passwordHash)
    expect(mockFindMemberByEmailUseCase.execute).toHaveBeenCalledWith(command.email)
    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      sub: member.id,
      email: member.email,
      name: member.name,
    })
    expect(result.accessToken).toBe("signed-token")
    expect(result.tokenType).toBe("Bearer")
    expect(result.expiresIn).toBe(3600)
  })

  it("should throw when member does not exist", async () => {
    mockAuthAccountRepository.findByEmail.mockResolvedValue(null)

    await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException)
    expect(mockHashingService.compare).not.toHaveBeenCalled()
    expect(mockJwtService.signAsync).not.toHaveBeenCalled()
  })

  it("should throw when password is invalid", async () => {
    const authAccount = AuthAccount.fromPersistence(1, command.email, "hashed")
    mockAuthAccountRepository.findByEmail.mockResolvedValue(authAccount)
    mockHashingService.compare.mockResolvedValue(false)

    await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException)
    expect(mockHashingService.compare).toHaveBeenCalledWith(command.password, authAccount.passwordHash)
    expect(mockJwtService.signAsync).not.toHaveBeenCalled()
  })

  it("should throw when member has no identifier", async () => {
    const authAccount = AuthAccount.fromPersistence(1, command.email, "hashed")
    mockAuthAccountRepository.findByEmail.mockResolvedValue(authAccount)
    mockHashingService.compare.mockResolvedValue(true)
    const member = Member.create("Ada Lovelace", command.email)
    mockFindMemberByEmailUseCase.execute.mockResolvedValue(member)

    await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException)
    expect(mockHashingService.compare).toHaveBeenCalledWith(command.password, authAccount.passwordHash)
    expect(mockJwtService.signAsync).not.toHaveBeenCalled()
  })

  it("should throw when member information is missing", async () => {
    const authAccount = AuthAccount.fromPersistence(1, command.email, "hashed")
    mockAuthAccountRepository.findByEmail.mockResolvedValue(authAccount)
    mockHashingService.compare.mockResolvedValue(true)
    mockFindMemberByEmailUseCase.execute.mockResolvedValue(null)

    await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException)
    expect(mockFindMemberByEmailUseCase.execute).toHaveBeenCalledWith(command.email)
    expect(mockJwtService.signAsync).not.toHaveBeenCalled()
  })
})
