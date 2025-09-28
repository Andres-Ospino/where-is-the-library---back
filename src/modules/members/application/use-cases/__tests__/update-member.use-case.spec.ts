import { UpdateMemberUseCase } from "../update-member.use-case"
import type { MemberRepositoryPort } from "../../../domain/ports/member-repository.port"
import { Member } from "../../../domain/entities/member.entity"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"

describe("UpdateMemberUseCase", () => {
  let useCase: UpdateMemberUseCase
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

    useCase = new UpdateMemberUseCase(memberRepository)
  })

  it("should update the member merging provided fields with existing data", async () => {
    memberRepository.findById.mockResolvedValue(existingMember)
    const persistedMember = Member.fromPersistence(1, "Ada Byron", "ada@example.com", "+44123450000")
    memberRepository.update.mockResolvedValue(persistedMember)

    const result = await useCase.execute({ id: 1, name: "Ada Byron", phone: "+44123450000" })

    expect(memberRepository.findById).toHaveBeenCalledWith(1)
    expect(memberRepository.update).toHaveBeenCalledTimes(1)
    const updatedMember = memberRepository.update.mock.calls[0][0]
    expect(updatedMember).toBeInstanceOf(Member)
    expect(updatedMember.id).toBe(1)
    expect(updatedMember.name).toBe("Ada Byron")
    expect(updatedMember.email).toBe(existingMember.email)
    expect(updatedMember.phone).toBe("+44123450000")
    expect(result).toBe(persistedMember)
  })

  it("should throw NotFoundError when the member does not exist", async () => {
    memberRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute({ id: 999, name: "No One" })).rejects.toThrow(NotFoundError)
    expect(memberRepository.update).not.toHaveBeenCalled()
  })
})
