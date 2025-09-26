import { Injectable, Inject } from "@nestjs/common"
import type { Member } from "../../domain/entities/member.entity"
import { type MemberRepositoryPort, MEMBER_REPOSITORY_TOKEN } from "../../domain/ports/member-repository.port"

@Injectable()
export class ListMembersUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY_TOKEN)
    private readonly memberRepository: MemberRepositoryPort,
  ) {}

  async execute(): Promise<Member[]> {
    return await this.memberRepository.findAll()
  }
}
