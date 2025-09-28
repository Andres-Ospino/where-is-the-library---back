import { Injectable } from "@nestjs/common"
import { Book } from "../../domain/entities/book.entity"
import type { BookRepositoryPort } from "../../domain/ports/book-repository.port"

interface BookRecord {
  id: number
  title: string
  author: string
  isbn: string
  available: boolean
  libraryId: number | null
}

@Injectable()
export class InMemoryBookRepository implements BookRepositoryPort {
  private books: BookRecord[] = []
  private nextId = 1

  async save(book: Book): Promise<Book> {
    const record: BookRecord = {
      id: this.nextId++,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      available: book.available,
      libraryId: book.libraryId ?? null,
    }

    this.books.push(record)

    return Book.fromPersistence(record.id, record.title, record.author, record.isbn, record.available, record.libraryId)
  }

  async findById(id: number): Promise<Book | null> {
    const record = this.books.find((book) => book.id === id)
    if (!record) {
      return null
    }

    return Book.fromPersistence(record.id, record.title, record.author, record.isbn, record.available, record.libraryId)
  }

  async findAll(): Promise<Book[]> {
    return this.books
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((record) =>
        Book.fromPersistence(record.id, record.title, record.author, record.isbn, record.available, record.libraryId),
      )
  }

  async update(book: Book): Promise<Book> {
    const id = book.id
    if (!id) {
      throw new Error("Cannot update book without ID")
    }

    const index = this.books.findIndex((record) => record.id === id)
    if (index === -1) {
      throw new Error(`Book with ID ${id} not found`)
    }

    const updated: BookRecord = {
      id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      available: book.available,
      libraryId: book.libraryId ?? null,
    }

    this.books[index] = updated

    return Book.fromPersistence(
      updated.id,
      updated.title,
      updated.author,
      updated.isbn,
      updated.available,
      updated.libraryId,
    )
  }

  async delete(id: number): Promise<void> {
    this.books = this.books.filter((book) => book.id !== id)
  }

  async findByTitle(title: string): Promise<Book[]> {
    const search = title.trim().toLowerCase()
    return this.books
      .filter((book) => book.title.toLowerCase().includes(search))
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((record) =>
        Book.fromPersistence(record.id, record.title, record.author, record.isbn, record.available, record.libraryId),
      )
  }

  async findByAuthor(author: string): Promise<Book[]> {
    const search = author.trim().toLowerCase()
    return this.books
      .filter((book) => book.author.toLowerCase().includes(search))
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((record) =>
        Book.fromPersistence(record.id, record.title, record.author, record.isbn, record.available, record.libraryId),
      )
  }

  clear(): void {
    this.books = []
    this.nextId = 1
  }
}
