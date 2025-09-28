import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger"
import { CreateLibraryUseCase } from "../../application/use-cases/create-library.use-case"
import { ListLibrariesUseCase } from "../../application/use-cases/list-libraries.use-case"
import { GetLibraryUseCase } from "../../application/use-cases/get-library.use-case"
import { CreateLibraryDto } from "../dtos/create-library.dto"
import { LibraryResponseDto } from "../dtos/library-response.dto"

@ApiTags("Bibliotecas")
@ApiBearerAuth()
@Controller("libraries")
export class LibrariesController {
  constructor(
    private readonly createLibraryUseCase: CreateLibraryUseCase,
    private readonly listLibrariesUseCase: ListLibrariesUseCase,
    private readonly getLibraryUseCase: GetLibraryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Registrar una nueva biblioteca" })
  @ApiCreatedResponse({ description: "Biblioteca creada correctamente", type: LibraryResponseDto })
  @ApiBadRequestResponse({ description: "Datos de entrada inválidos" })
  async create(@Body() createLibraryDto: CreateLibraryDto): Promise<LibraryResponseDto> {
    const library = await this.createLibraryUseCase.execute({
      name: createLibraryDto.name,
      address: createLibraryDto.address,
      openingHours: createLibraryDto.openingHours,
    })

    return LibraryResponseDto.fromEntity(library)
  }

  @Get()
  @ApiOperation({ summary: "Listar bibliotecas con sus libros asociados" })
  @ApiOkResponse({
    description: "Listado de bibliotecas incluyendo los libros registrados en cada una",
    type: LibraryResponseDto,
    isArray: true,
  })
  async findAll(): Promise<LibraryResponseDto[]> {
    const libraries = await this.listLibrariesUseCase.execute()
    return libraries.map((library) => LibraryResponseDto.fromEntity(library))
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener detalle de una biblioteca y sus libros" })
  @ApiParam({ name: "id", type: Number, description: "Identificador de la biblioteca" })
  @ApiOkResponse({ description: "Biblioteca encontrada", type: LibraryResponseDto })
  @ApiNotFoundResponse({ description: "Biblioteca no encontrada" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<LibraryResponseDto> {
    const library = await this.getLibraryUseCase.execute({ id })
    return LibraryResponseDto.fromEntity(library)
  }
}
