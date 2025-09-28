import { DeleteMemberUseCase } from "../delete-member.use-case"
import type { MemberRepositoryPort } from "../../../domain/ports/member-repository.port"
import { Member } from "../../../domain/entities/member.entity"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"

describe("DeleteMemberUseCase", () => {
  let useCase: DeleteMemberUseCase
  let memberRepository: jest.Mocked<MemberRepositoryPort>
  const existingMember = Member.fromPersistence(1, "Ada Lovelace", "ada@example.com", "+44123456789")

  beforeEach(() => {
    memberRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<MemberRepositoryPort>

    useCase = new DeleteMemberUseCase(memberRepository)
  })

  it("should delete the member when it exists", async () => {
    memberRepository.findById.mockResolvedValue(existingMember)

    await useCase.execute({ id: 1 })

    expect(memberRepository.findById).toHaveBeenCalledWith(1)
    expect(memberRepository.delete).toHaveBeenCalledWith(1)
  })

  it("should throw NotFoundError when the member does not exist", async () => {
    memberRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute({ id: 999 })).rejects.toThrow(NotFoundError)
    expect(memberRepository.delete).not.toHaveBeenCalled()
  })
})
