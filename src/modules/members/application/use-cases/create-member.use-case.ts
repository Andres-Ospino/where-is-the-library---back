import { Injectable, Inject } from "@nestjs/common"

import { Member } from "../../domain/entities/member.entity"
import { type MemberRepositoryPort, MEMBER_REPOSITORY_TOKEN } from "../../domain/ports/member-repository.port"
import { ConflictError } from "@/modules/shared/errors/conflict.error"
import { HASHING_SERVICE_TOKEN, type HashingPort } from "@/modules/shared/ports/hashing.port"

export interface CreateMemberCommand {
  name: string
  email: string
  password: string
}

@Injectable()
export class CreateMemberUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY_TOKEN)
    private readonly memberRepository: MemberRepositoryPort,
    @Inject(HASHING_SERVICE_TOKEN)
    private readonly hashingService: HashingPort,
  ) {}

  async execute(command: CreateMemberCommand): Promise<Member> {
    const existingMember = await this.memberRepository.findByEmail(command.email)
    if (existingMember) {
      throw new ConflictError("Member with this email already exists")
    }

    const passwordHash = await this.hashingService.hash(command.password)
    const member = Member.create(command.name, command.email, passwordHash)
    return await this.memberRepository.save(member)
  }
}
