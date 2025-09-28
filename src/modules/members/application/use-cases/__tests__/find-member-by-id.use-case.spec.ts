import { FindMemberByIdUseCase } from "../find-member-by-id.use-case"
import type { MemberRepositoryPort } from "../../../domain/ports/member-repository.port"
import { Member } from "../../../domain/entities/member.entity"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"

describe("FindMemberByIdUseCase", () => {
  let useCase: FindMemberByIdUseCase
  let mockMemberRepository: jest.Mocked<MemberRepositoryPort>

  beforeEach(() => {
    mockMemberRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<MemberRepositoryPort>

    useCase = new FindMemberByIdUseCase(mockMemberRepository)
  })

  it("should return the member when it exists", async () => {
    const member = Member.fromPersistence(1, "Ada Lovelace", "ada@example.com", "+44000000000")
    mockMemberRepository.findById.mockResolvedValue(member)

    const result = await useCase.execute({ id: 1 })

    expect(mockMemberRepository.findById).toHaveBeenCalledWith(1)
    expect(result).toEqual(member)
  })

  it("should throw NotFoundError when member does not exist", async () => {
    mockMemberRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute({ id: 99 })).rejects.toThrow(new NotFoundError("Member", 99))
    expect(mockMemberRepository.findById).toHaveBeenCalledWith(99)
  })
})
