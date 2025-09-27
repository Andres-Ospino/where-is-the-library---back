import { CreateMemberUseCase } from "../create-member.use-case"
import { Member } from "../../../domain/entities/member.entity"
import { ConflictError } from "@/modules/shared/errors/conflict.error"
import type { MemberRepositoryPort } from "../../../domain/ports/member-repository.port"
import type { HashingPort } from "@/modules/shared/ports/hashing.port"

describe("CreateMemberUseCase", () => {
  let useCase: CreateMemberUseCase
  let mockMemberRepository: jest.Mocked<MemberRepositoryPort>
  let mockHashingService: jest.Mocked<HashingPort>

  const command = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "Password123!",
  }

  beforeEach(() => {
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

    useCase = new CreateMemberUseCase(mockMemberRepository, mockHashingService)
  })

  it("should hash the password and persist the member", async () => {
    const hashedPassword = "hashed-value"
    mockMemberRepository.findByEmail.mockResolvedValue(null)
    mockHashingService.hash.mockResolvedValue(hashedPassword)

    const persistedMember = Member.fromPersistence(1, command.name, command.email, hashedPassword)
    mockMemberRepository.save.mockResolvedValue(persistedMember)

    const result = await useCase.execute(command)

    expect(mockMemberRepository.findByEmail).toHaveBeenCalledWith(command.email)
    expect(mockHashingService.hash).toHaveBeenCalledWith(command.password)
    expect(mockMemberRepository.save).toHaveBeenCalled()
    const savedMember = mockMemberRepository.save.mock.calls[0][0] as Member
    expect(savedMember).toBeInstanceOf(Member)
    expect(savedMember.id).toBeNull()
    expect(savedMember.passwordHash).toBe(hashedPassword)
    expect(result).toBe(persistedMember)
  })

  it("should throw ConflictError when email already exists", async () => {
    const existingMember = Member.fromPersistence(1, command.name, command.email, "hash")
    mockMemberRepository.findByEmail.mockResolvedValue(existingMember)

    await expect(useCase.execute(command)).rejects.toThrow(ConflictError)
    expect(mockHashingService.hash).not.toHaveBeenCalled()
    expect(mockMemberRepository.save).not.toHaveBeenCalled()
  })
})
