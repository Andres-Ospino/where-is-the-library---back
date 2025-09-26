import type { Book } from "../entities/book.entity"

export const BOOK_REPOSITORY_TOKEN = Symbol("BookRepository")

export interface BookRepositoryPort {
  save(book: Book): Promise<Book>
  findById(id: number): Promise<Book | null>
  findAll(): Promise<Book[]>
  update(book: Book): Promise<Book>
  delete(id: number): Promise<void>
  findByTitle(title: string): Promise<Book[]>
  findByAuthor(author: string): Promise<Book[]>
}
