import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  ParseIntPipe,
} from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger"
import { LoanBookUseCase } from "../../application/use-cases/loan-book.use-case"
import { ReturnBookUseCase } from "../../application/use-cases/return-book.use-case"
import { ListLoansUseCase } from "../../application/use-cases/list-loans.use-case"
import { CreateLoanDto } from "@/modules/shared/dtos/create-loan.dto"
import { LoanResponseDto } from "../dtos/loan-response.dto"

@ApiTags("Préstamos")
@ApiBearerAuth()
@Controller("loans")
export class LoansController {
  constructor(
    private readonly loanBookUseCase: LoanBookUseCase,
    private readonly returnBookUseCase: ReturnBookUseCase,
    private readonly listLoansUseCase: ListLoansUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Registrar un nuevo préstamo" })
  @ApiCreatedResponse({ description: "Préstamo creado correctamente", type: LoanResponseDto })
  @ApiBadRequestResponse({ description: "Datos de entrada inválidos" })
  async create(@Body() createLoanDto: CreateLoanDto): Promise<LoanResponseDto> {
    const loan = await this.loanBookUseCase.execute({
      bookId: createLoanDto.bookId,
      memberId: createLoanDto.memberId,
    })

    return LoanResponseDto.fromEntity(loan)
  }

  @Post(":id/return")
  @ApiOperation({ summary: "Registrar la devolución de un libro" })
  @ApiParam({ name: "id", type: Number, description: "Identificador del préstamo" })
  @ApiOkResponse({ description: "Préstamo actualizado", type: LoanResponseDto })
  async returnBook(@Param("id", ParseIntPipe) id: number): Promise<LoanResponseDto> {
    const loan = await this.returnBookUseCase.execute({ loanId: id })

    return LoanResponseDto.fromEntity(loan)
  }

  @Get()
  @ApiOperation({ summary: "Listar préstamos" })
  @ApiOkResponse({ description: "Listado de préstamos", type: LoanResponseDto, isArray: true })
  @ApiQuery({ name: "bookId", required: false, description: "Filtra por libro" })
  @ApiQuery({ name: "memberId", required: false, description: "Filtra por miembro" })
  @ApiQuery({
    name: "activeOnly",
    required: false,
    description: "Si es true solo muestra préstamos activos",
  })
  @ApiBadRequestResponse({ description: "Parámetros de consulta inválidos" })
  async findAll(
    @Query("bookId") bookId?: string,
    @Query("memberId") memberId?: string,
    @Query("activeOnly") activeOnly?: string,
  ): Promise<LoanResponseDto[]> {
    const parsedBookId = bookId !== undefined ? Number.parseInt(bookId, 10) : undefined
    const parsedMemberId = memberId !== undefined ? Number.parseInt(memberId, 10) : undefined

    if ((bookId !== undefined && Number.isNaN(parsedBookId)) || (memberId !== undefined && Number.isNaN(parsedMemberId))) {
      throw new BadRequestException("bookId and memberId must be numeric")
    }

    const loans = await this.listLoansUseCase.execute({
      bookId: parsedBookId,
      memberId: parsedMemberId,
      activeOnly: activeOnly === "true",
    })

    return loans.map((loan) => LoanResponseDto.fromEntity(loan))
  }
}
