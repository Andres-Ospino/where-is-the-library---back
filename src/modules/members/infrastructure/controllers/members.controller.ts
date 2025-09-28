import { Controller, Get, Post, Body, ValidationPipe } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"

import { CreateMemberUseCase } from "../../application/use-cases/create-member.use-case"
import { ListMembersUseCase } from "../../application/use-cases/list-members.use-case"
import { CreateMemberDto } from "@/modules/shared/dtos/create-member.dto"
import { Public } from "@/modules/auth/decorators/public.decorator"
import { MemberResponseDto } from "../dtos/member-response.dto"

@ApiTags("Miembros")
@Controller("members")
export class MembersController {
  constructor(
    private readonly createMemberUseCase: CreateMemberUseCase,
    private readonly listMembersUseCase: ListMembersUseCase,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: "Registrar un nuevo miembro" })
  @ApiCreatedResponse({ description: "Miembro creado correctamente", type: MemberResponseDto })
  @ApiBadRequestResponse({ description: "Datos de entrada inválidos" })
  async create(@Body(new ValidationPipe()) createMemberDto: CreateMemberDto): Promise<MemberResponseDto> {
    const member = await this.createMemberUseCase.execute({
      name: createMemberDto.name,
      email: createMemberDto.email,
      phone: createMemberDto.phone,
    })

    return MemberResponseDto.fromEntity(member)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Listar miembros registrados" })
  @ApiOkResponse({ description: "Listado de miembros", type: MemberResponseDto, isArray: true })
  async findAll(): Promise<MemberResponseDto[]> {
    const members = await this.listMembersUseCase.execute()

    return members.map((member) => MemberResponseDto.fromEntity(member))
  }
}
