import { Controller, Get, Post, Body, ValidationPipe } from "@nestjs/common"
import type { CreateMemberUseCase } from "../../application/use-cases/create-member.use-case"
import type { ListMembersUseCase } from "../../application/use-cases/list-members.use-case"
import type { CreateMemberDto } from "@/modules/shared/dtos/create-member.dto"

@Controller("members")
export class MembersController {
  constructor(
    private readonly createMemberUseCase: CreateMemberUseCase,
    private readonly listMembersUseCase: ListMembersUseCase,
  ) {}

  @Post()
  async create(@Body(new ValidationPipe()) createMemberDto: CreateMemberDto) {
    const member = await this.createMemberUseCase.execute({
      name: createMemberDto.name,
      email: createMemberDto.email,
    });

    return {
      id: member.id,
      name: member.name,
      email: member.email,
    };
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
