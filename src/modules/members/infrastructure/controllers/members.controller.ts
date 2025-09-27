import { Controller, Get, Post, Body, ValidationPipe } from "@nestjs/common"

import { CreateMemberUseCase } from "../../application/use-cases/create-member.use-case"
import { ListMembersUseCase } from "../../application/use-cases/list-members.use-case"
import { CreateMemberDto } from "@/modules/shared/dtos/create-member.dto"
import { Public } from "@/modules/auth/decorators/public.decorator"

@Controller("members")
export class MembersController {
  constructor(
    private readonly createMemberUseCase: CreateMemberUseCase,
    private readonly listMembersUseCase: ListMembersUseCase,
  ) {}

  @Public()
  @Post()
  async create(@Body(new ValidationPipe()) createMemberDto: CreateMemberDto) {
    const member = await this.createMemberUseCase.execute({
      name: createMemberDto.name,
      email: createMemberDto.email,
      password: createMemberDto.password,
    })

    return {
      id: member.id,
      name: member.name,
      email: member.email,
    }
  }

  @Get()
  async findAll() {
    const members = await this.listMembersUseCase.execute()

    return members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
    }))
  }
}
