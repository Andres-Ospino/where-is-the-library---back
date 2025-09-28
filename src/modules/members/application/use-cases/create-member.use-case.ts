import { Injectable, Inject } from "@nestjs/common"

import { Member } from "../../domain/entities/member.entity"
import { type MemberRepositoryPort, MEMBER_REPOSITORY_TOKEN } from "../../domain/ports/member-repository.port"
import { ConflictError } from "@/modules/shared/errors/conflict.error"
export interface CreateMemberCommand {
  name: string
  email: string
  phone: string
}

@Injectable()
export class CreateMemberUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY_TOKEN)
    private readonly memberRepository: MemberRepositoryPort,
  ) {}

  async execute(command: CreateMemberCommand): Promise<Member> {
    const existingMember = await this.memberRepository.findByEmail(command.email)
    if (existingMember) {
      throw new ConflictError("Member with this email already exists")
    }

    const member = Member.create(command.name, command.email, command.phone)
    return await this.memberRepository.save(member)
  }
}
