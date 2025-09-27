import { Inject, Injectable } from "@nestjs/common"

import type { Member } from "../../domain/entities/member.entity"
import { MEMBER_REPOSITORY_TOKEN, type MemberRepositoryPort } from "../../domain/ports/member-repository.port"

@Injectable()
export class FindMemberByEmailUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY_TOKEN)
    private readonly memberRepository: MemberRepositoryPort,
  ) {}

  async execute(email: string): Promise<Member | null> {
    return await this.memberRepository.findByEmail(email)
  }
}
