import { Module } from "@nestjs/common"
import { MembersController } from "./infrastructure/controllers/members.controller"
import { CreateMemberUseCase } from "./application/use-cases/create-member.use-case"
import { ListMembersUseCase } from "./application/use-cases/list-members.use-case"
import { PrismaMemberRepository } from "./infrastructure/repositories/prisma-member.repository"
import { MEMBER_REPOSITORY_TOKEN } from "./domain/ports/member-repository.port"

@Module({
  controllers: [MembersController],
  providers: [
    CreateMemberUseCase,
    ListMembersUseCase,
    {
      provide: MEMBER_REPOSITORY_TOKEN,
      useClass: PrismaMemberRepository,
    },
  ],
  exports: [MEMBER_REPOSITORY_TOKEN],
})
export class MembersModule {}
