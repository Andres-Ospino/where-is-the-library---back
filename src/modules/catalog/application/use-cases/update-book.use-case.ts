import { Injectable } from "@nestjs/common"
import { Book } from "../../domain/entities/book.entity"
import { type BookRepositoryPort, BOOK_REPOSITORY_TOKEN } from "../../domain/ports/book-repository.port"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"
import { Inject } from "@nestjs/common"

export interface UpdateBookCommand {
  id: number
  title: string
  author: string
  isbn: string
}

@Injectable()
export class UpdateBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY_TOKEN)
    private readonly bookRepository: BookRepositoryPort,
  ) {}

  async execute(command: UpdateBookCommand): Promise<Book> {
    const existingBook = await this.bookRepository.findById(command.id)
    if (!existingBook) {
      throw new NotFoundError("Book", command.id)
    }

    const updatedBook = Book.fromPersistence(
      command.id,
      command.title,
      command.author,
      command.isbn,
      existingBook.available,
    )

    return await this.bookRepository.update(updatedBook)
  }
}
