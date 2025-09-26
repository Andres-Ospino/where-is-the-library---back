import { Injectable, Inject } from "@nestjs/common"
import type { Book } from "../../domain/entities/book.entity"
import { type BookRepositoryPort, BOOK_REPOSITORY_TOKEN } from "../../domain/ports/book-repository.port"

export interface ListBooksQuery {
  title?: string
  author?: string
}

@Injectable()
export class ListBooksUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY_TOKEN) private readonly bookRepository: BookRepositoryPort,
  ) {}

  async execute(query?: ListBooksQuery): Promise<Book[]> {
    if (query?.title) {
      return await this.bookRepository.findByTitle(query.title)
    }

    if (query?.author) {
      return await this.bookRepository.findByAuthor(query.author)
    }

    return await this.bookRepository.findAll()
  }
}
