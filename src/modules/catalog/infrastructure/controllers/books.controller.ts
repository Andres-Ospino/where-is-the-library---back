import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  NotFoundException,
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
  ApiNotFoundResponse,
} from "@nestjs/swagger"
import { CreateBookUseCase } from "../../application/use-cases/create-book.use-case"
import { ListBooksUseCase } from "../../application/use-cases/list-books.use-case"
import { UpdateBookUseCase } from "../../application/use-cases/update-book.use-case"
import { RemoveBookUseCase } from "../../application/use-cases/remove-book.use-case"
import { CreateBookDto } from "@/modules/shared/dtos/create-book.dto"
import { UpdateBookDto } from "@/modules/shared/dtos/update-book.dto"
import { BookResponseDto } from "../dtos/book-response.dto"

@ApiTags("Libros")
@ApiBearerAuth()
@Controller("books")
export class BooksController {
  constructor(
    private readonly createBookUseCase: CreateBookUseCase,
    private readonly listBooksUseCase: ListBooksUseCase,
    private readonly updateBookUseCase: UpdateBookUseCase,
    private readonly removeBookUseCase: RemoveBookUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo libro" })
  @ApiCreatedResponse({ description: "Libro creado correctamente", type: BookResponseDto })
  @ApiBadRequestResponse({ description: "Datos de entrada inválidos" })
  async create(@Body() createBookDto: CreateBookDto): Promise<BookResponseDto> {
    const book = await this.createBookUseCase.execute({
      title: createBookDto.title,
      author: createBookDto.author,
      isbn: createBookDto.isbn,
    })

    return BookResponseDto.fromEntity(book)
  }

  @Get()
  @ApiOperation({ summary: "Listar libros" })
  @ApiOkResponse({ description: "Listado de libros", type: BookResponseDto, isArray: true })
  @ApiQuery({ name: "title", required: false, description: "Filtra por coincidencia de título" })
  @ApiQuery({ name: "author", required: false, description: "Filtra por coincidencia de autor" })
  async findAll(@Query("title") title?: string, @Query("author") author?: string): Promise<BookResponseDto[]> {
    const books = await this.listBooksUseCase.execute({ title, author })

    return books.map((book) => BookResponseDto.fromEntity(book))
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener detalle de un libro" })
  @ApiParam({ name: "id", type: Number, description: "Identificador del libro" })
  @ApiOkResponse({ description: "Libro encontrado", type: BookResponseDto })
  @ApiNotFoundResponse({ description: "Libro no encontrado" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<BookResponseDto> {
    const books = await this.listBooksUseCase.execute()
    const book = books.find((b) => b.id === id)

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`)
    }

    return BookResponseDto.fromEntity(book)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar un libro" })
  @ApiParam({ name: "id", type: Number, description: "Identificador del libro" })
  @ApiOkResponse({ description: "Libro actualizado", type: BookResponseDto })
  @ApiBadRequestResponse({ description: "Datos de entrada inválidos" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<BookResponseDto> {
    const book = await this.updateBookUseCase.execute({
      id,
      title: updateBookDto.title,
      author: updateBookDto.author,
      isbn: updateBookDto.isbn,
    })

    return BookResponseDto.fromEntity(book)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar un libro" })
  @ApiParam({ name: "id", type: Number, description: "Identificador del libro" })
  @ApiOkResponse({ description: "Libro eliminado correctamente" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.removeBookUseCase.execute({ id })
    return { message: "Book deleted successfully" }
  }
}
