import { Inject, Injectable } from "@nestjs/common"

import { MEMBER_REPOSITORY_TOKEN, type MemberRepositoryPort } from "../../domain/ports/member-repository.port"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"

export interface DeleteMemberCommand {
  id: number
}

@Injectable()
export class DeleteMemberUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY_TOKEN)
    private readonly memberRepository: MemberRepositoryPort,
  ) {}

  async execute(command: DeleteMemberCommand): Promise<void> {
    const existingMember = await this.memberRepository.findById(command.id)

    if (!existingMember) {
      throw new NotFoundError("Member", command.id)
    }

    await this.memberRepository.delete(command.id)
  }
}
