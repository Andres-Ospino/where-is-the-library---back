import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
} from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger"

import { CreateMemberUseCase } from "../../application/use-cases/create-member.use-case"
import { ListMembersUseCase } from "../../application/use-cases/list-members.use-case"
import { UpdateMemberUseCase } from "../../application/use-cases/update-member.use-case"
import { DeleteMemberUseCase } from "../../application/use-cases/delete-member.use-case"
import { CreateMemberDto } from "@/modules/shared/dtos/create-member.dto"
import { UpdateMemberDto } from "@/modules/shared/dtos/update-member.dto"
import { Public } from "@/modules/auth/decorators/public.decorator"
import { MemberResponseDto } from "../dtos/member-response.dto"

@ApiTags("Miembros")
@Controller("members")
export class MembersController {
  constructor(
    private readonly createMemberUseCase: CreateMemberUseCase,
    private readonly listMembersUseCase: ListMembersUseCase,
    private readonly updateMemberUseCase: UpdateMemberUseCase,
    private readonly deleteMemberUseCase: DeleteMemberUseCase,
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

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Actualizar un miembro" })
  @ApiParam({ name: "id", type: Number, description: "Identificador del miembro" })
  @ApiOkResponse({ description: "Miembro actualizado correctamente", type: MemberResponseDto })
  @ApiBadRequestResponse({ description: "Datos de entrada inválidos" })
  @ApiNotFoundResponse({ description: "Miembro no encontrado" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateMemberDto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    const member = await this.updateMemberUseCase.execute({
      id,
      name: updateMemberDto.name,
      email: updateMemberDto.email,
      phone: updateMemberDto.phone,
    })

    return MemberResponseDto.fromEntity(member)
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Eliminar un miembro" })
  @ApiParam({ name: "id", type: Number, description: "Identificador del miembro" })
  @ApiNoContentResponse({ description: "Miembro eliminado correctamente" })
  @ApiNotFoundResponse({ description: "Miembro no encontrado" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.deleteMemberUseCase.execute({ id })
  }
}
