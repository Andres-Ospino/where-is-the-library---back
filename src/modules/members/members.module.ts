import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { MembersController } from "./infrastructure/controllers/members.controller"
import { CreateMemberUseCase } from "./application/use-cases/create-member.use-case"
import { FindMemberByEmailUseCase } from "./application/use-cases/find-member-by-email.use-case"
import { FindMemberByIdUseCase } from "./application/use-cases/find-member-by-id.use-case"
import { ListMembersUseCase } from "./application/use-cases/list-members.use-case"
import { MEMBER_REPOSITORY_TOKEN } from "./domain/ports/member-repository.port"
import { TypeormMemberRepository } from "./infrastructure/repositories/typeorm-member.repository"
import { MemberOrmEntity } from "./infrastructure/persistence/typeorm/member.orm-entity"
import { UpdateMemberUseCase } from "./application/use-cases/update-member.use-case"
import { DeleteMemberUseCase } from "./application/use-cases/delete-member.use-case"

@Module({
  imports: [TypeOrmModule.forFeature([MemberOrmEntity])],
  controllers: [MembersController],
  providers: [
    CreateMemberUseCase,
    FindMemberByEmailUseCase,
    ListMembersUseCase,
    FindMemberByIdUseCase,
    UpdateMemberUseCase,
    DeleteMemberUseCase,
    {
      provide: MEMBER_REPOSITORY_TOKEN,
      useClass: TypeormMemberRepository,
    },
  ],
  exports: [MEMBER_REPOSITORY_TOKEN, FindMemberByEmailUseCase, FindMemberByIdUseCase],
})
export class MembersModule {}
