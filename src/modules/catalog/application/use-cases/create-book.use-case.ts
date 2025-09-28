import { Inject, Injectable } from "@nestjs/common"
import { Book } from "../../domain/entities/book.entity"
import { type BookRepositoryPort, BOOK_REPOSITORY_TOKEN } from "../../domain/ports/book-repository.port"

export interface CreateBookCommand {
  title: string
  author: string
  isbn: string
  libraryId?: number | null
}

@Injectable()
export class CreateBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY_TOKEN)
    private readonly bookRepository: BookRepositoryPort,
  ) {}

  async execute(command: CreateBookCommand): Promise<Book> {
    const book = Book.create(command.title, command.author, command.isbn, command.libraryId)
    return await this.bookRepository.save(book)
  }
}
