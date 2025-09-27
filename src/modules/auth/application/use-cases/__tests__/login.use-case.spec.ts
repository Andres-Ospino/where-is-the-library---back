import { LoginUseCase } from "../login.use-case"
import { Member } from "@/modules/members/domain/entities/member.entity"
import type { MemberRepositoryPort } from "@/modules/members/domain/ports/member-repository.port"
import type { HashingPort } from "@/modules/shared/ports/hashing.port"
import { JwtService } from "@nestjs/jwt"
import { UnauthorizedException } from "@nestjs/common"

describe("LoginUseCase", () => {
  let useCase: LoginUseCase
  let mockMemberRepository: jest.Mocked<MemberRepositoryPort>
  let mockHashingService: jest.Mocked<HashingPort>
  let mockJwtService: jest.Mocked<JwtService>
  let dateNowSpy: jest.SpyInstance<number, []>

  const command = {
    email: "ada@example.com",
    password: "Password123!",
  }

  const nowInSeconds = 1_700_000_000

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(nowInSeconds * 1000)

    mockMemberRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<MemberRepositoryPort>

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

    useCase = new LoginUseCase(mockMemberRepository, mockJwtService, mockHashingService)
  })

  afterEach(() => {
    dateNowSpy.mockRestore()
  })

  it("should authenticate a member with valid credentials", async () => {
    const member = Member.fromPersistence(1, "Ada Lovelace", command.email, "hashed")
    mockMemberRepository.findByEmail.mockResolvedValue(member)
    mockHashingService.compare.mockResolvedValue(true)
    mockJwtService.signAsync.mockResolvedValue("signed-token")
    mockJwtService.decode.mockReturnValue({ exp: nowInSeconds + 3600 })

    const result = await useCase.execute(command)

    expect(mockMemberRepository.findByEmail).toHaveBeenCalledWith(command.email)
    expect(mockHashingService.compare).toHaveBeenCalledWith(command.password, member.passwordHash)
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
    mockMemberRepository.findByEmail.mockResolvedValue(null)

    await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException)
    expect(mockHashingService.compare).not.toHaveBeenCalled()
    expect(mockJwtService.signAsync).not.toHaveBeenCalled()
  })

  it("should throw when password is invalid", async () => {
    const member = Member.fromPersistence(1, "Ada Lovelace", command.email, "hashed")
    mockMemberRepository.findByEmail.mockResolvedValue(member)
    mockHashingService.compare.mockResolvedValue(false)

    await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException)
    expect(mockHashingService.compare).toHaveBeenCalledWith(command.password, member.passwordHash)
    expect(mockJwtService.signAsync).not.toHaveBeenCalled()
  })

  it("should throw when member has no identifier", async () => {
    const member = Member.create("Ada Lovelace", command.email, "hashed")
    mockMemberRepository.findByEmail.mockResolvedValue(member)
    mockHashingService.compare.mockResolvedValue(true)

    await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException)
    expect(mockHashingService.compare).toHaveBeenCalledWith(command.password, member.passwordHash)
    expect(mockJwtService.signAsync).not.toHaveBeenCalled()
  })
})
