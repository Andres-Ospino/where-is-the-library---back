import { Inject, Injectable } from "@nestjs/common"

import type { Member } from "../../domain/entities/member.entity"
import { MEMBER_REPOSITORY_TOKEN, type MemberRepositoryPort } from "../../domain/ports/member-repository.port"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"

export interface FindMemberByIdQuery {
  id: number
}

@Injectable()
export class FindMemberByIdUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY_TOKEN)
    private readonly memberRepository: MemberRepositoryPort,
  ) {}

  async execute(query: FindMemberByIdQuery): Promise<Member> {
    const member = await this.memberRepository.findById(query.id)

    if (!member) {
      throw new NotFoundError("Member", query.id)
    }

    return member
  }
}
