import { ListMembersUseCase } from "../list-members.use-case"
import type { MemberRepositoryPort } from "../../../domain/ports/member-repository.port"
import { Member } from "../../../domain/entities/member.entity"

describe("ListMembersUseCase", () => {
  let useCase: ListMembersUseCase
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

    useCase = new ListMembersUseCase(mockMemberRepository)
  })

  it("should delegate to the repository and return members in the same order", async () => {
    const members = [
      Member.fromPersistence(2, "Grace Hopper", "grace@example.com"),
      Member.fromPersistence(1, "Ada Lovelace", "ada@example.com"),
    ]

    mockMemberRepository.findAll.mockResolvedValue(members)

    const result = await useCase.execute()

    expect(mockMemberRepository.findAll).toHaveBeenCalledTimes(1)
    expect(result).toEqual(members)
  })
})
