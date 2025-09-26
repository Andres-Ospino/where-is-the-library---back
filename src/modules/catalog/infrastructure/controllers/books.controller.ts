import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from "@nestjs/common"
import type { CreateBookUseCase } from "../../application/use-cases/create-book.use-case"
import type { ListBooksUseCase } from "../../application/use-cases/list-books.use-case"
import type { UpdateBookUseCase } from "../../application/use-cases/update-book.use-case"
import type { RemoveBookUseCase } from "../../application/use-cases/remove-book.use-case"
import type { CreateBookDto } from "@/modules/shared/dtos/create-book.dto"
import type { UpdateBookDto } from "@/modules/shared/dtos/update-book.dto"

@Controller("books")
export class BooksController {
  constructor(
    private readonly createBookUseCase: CreateBookUseCase,
    private readonly listBooksUseCase: ListBooksUseCase,
    private readonly updateBookUseCase: UpdateBookUseCase,
    private readonly removeBookUseCase: RemoveBookUseCase,
  ) {}

  @Post()
  async create(@Body() createBookDto: CreateBookDto) {
    const book = await this.createBookUseCase.execute({
      title: createBookDto.title,
      author: createBookDto.author,
    });

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      available: book.available,
    };
  }

  @Get()
  async findAll(@Query('title') title?: string, @Query('author') author?: string) {
    const books = await this.listBooksUseCase.execute({ title, author })

    return books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      available: book.available,
    }))
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const books = await this.listBooksUseCase.execute();
    const book = books.find((b) => b.id === id);

    if (!book) {
      throw new Error('Book not found');
    }

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      available: book.available,
    };
  }

  @Patch(":id")
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateBookDto: UpdateBookDto) {
    const book = await this.updateBookUseCase.execute({
      id,
      title: updateBookDto.title,
      author: updateBookDto.author,
    })

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      available: book.available,
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.removeBookUseCase.execute({ id });
    return { message: 'Book deleted successfully' };
  }
}
