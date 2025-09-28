import { CreateMemberUseCase } from "../create-member.use-case"
import { Member } from "../../../domain/entities/member.entity"
import { ConflictError } from "@/modules/shared/errors/conflict.error"
import type { MemberRepositoryPort } from "../../../domain/ports/member-repository.port"

describe("CreateMemberUseCase", () => {
  let useCase: CreateMemberUseCase
  let mockMemberRepository: jest.Mocked<MemberRepositoryPort>
  const command = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+44123456789",
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

    useCase = new CreateMemberUseCase(mockMemberRepository)
  })

  it("should persist the member without hashing operations", async () => {
    mockMemberRepository.findByEmail.mockResolvedValue(null)

    const persistedMember = Member.fromPersistence(1, command.name, command.email, command.phone)
    mockMemberRepository.save.mockResolvedValue(persistedMember)

    const result = await useCase.execute(command)

    expect(mockMemberRepository.findByEmail).toHaveBeenCalledWith(command.email)
    expect(mockMemberRepository.save).toHaveBeenCalled()
    const savedMember = mockMemberRepository.save.mock.calls[0][0] as Member
    expect(savedMember).toBeInstanceOf(Member)
    expect(savedMember.id).toBeNull()
    expect(savedMember.phone).toBe(command.phone)
    expect(result).toBe(persistedMember)
  })

  it("should throw ConflictError when email already exists", async () => {
    const existingMember = Member.fromPersistence(1, command.name, command.email, command.phone)
    mockMemberRepository.findByEmail.mockResolvedValue(existingMember)

    await expect(useCase.execute(command)).rejects.toThrow(ConflictError)
    expect(mockMemberRepository.save).not.toHaveBeenCalled()
  })
})
