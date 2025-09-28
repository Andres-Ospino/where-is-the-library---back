import { Inject, Injectable } from "@nestjs/common"

import { Member } from "../../domain/entities/member.entity"
import { MEMBER_REPOSITORY_TOKEN, type MemberRepositoryPort } from "../../domain/ports/member-repository.port"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"

export interface UpdateMemberCommand {
  id: number
  name?: string
  email?: string
  phone?: string
}

@Injectable()
export class UpdateMemberUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY_TOKEN)
    private readonly memberRepository: MemberRepositoryPort,
  ) {}

  async execute(command: UpdateMemberCommand): Promise<Member> {
    const existingMember = await this.memberRepository.findById(command.id)

    if (!existingMember) {
      throw new NotFoundError("Member", command.id)
    }

    const updatedMember = Member.fromPersistence(
      existingMember.id ?? command.id,
      command.name ?? existingMember.name,
      command.email ?? existingMember.email,
      command.phone ?? existingMember.phone,
    )

    return await this.memberRepository.update(updatedMember)
  }
}
