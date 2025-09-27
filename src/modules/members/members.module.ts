import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MembersController } from "./infrastructure/controllers/members.controller"
import { CreateMemberUseCase } from "./application/use-cases/create-member.use-case"
import { ListMembersUseCase } from "./application/use-cases/list-members.use-case"
<<<<<<< HEAD
import { InMemoryMemberRepository } from "./infrastructure/repositories/in-memory-member.repository"
=======
>>>>>>> origin/codex/remove-prisma-ldugxq
import { MEMBER_REPOSITORY_TOKEN } from "./domain/ports/member-repository.port"
import { TypeormMemberRepository } from "./infrastructure/repositories/typeorm-member.repository"
import { MemberOrmEntity } from "./infrastructure/persistence/typeorm/member.orm-entity"

@Module({
  imports: [TypeOrmModule.forFeature([MemberOrmEntity])],
  controllers: [MembersController],
  providers: [
    CreateMemberUseCase,
    ListMembersUseCase,
    {
      provide: MEMBER_REPOSITORY_TOKEN,
<<<<<<< HEAD
      useClass: InMemoryMemberRepository,
=======
      useClass: TypeormMemberRepository,
>>>>>>> origin/codex/remove-prisma-ldugxq
    },
  ],
  exports: [MEMBER_REPOSITORY_TOKEN],
})
export class MembersModule {}
