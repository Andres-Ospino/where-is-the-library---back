import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/core/database/prisma.service"
import { Book } from "../../domain/entities/book.entity"
import type { BookRepositoryPort } from "../../domain/ports/book-repository.port"

@Injectable()
export class PrismaBookRepository implements BookRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(book: Book): Promise<Book> {
    const data = await this.prisma.book.create({
      data: {
        title: book.title,
        author: book.author,
        available: book.available,
      },
    })

    return Book.fromPersistence(data.id, data.title, data.author, data.available)
  }

  async findById(id: number): Promise<Book | null> {
    const data = await this.prisma.book.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return Book.fromPersistence(data.id, data.title, data.author, data.available)
  }

  async findAll(): Promise<Book[]> {
    const data = await this.prisma.book.findMany({
      orderBy: { title: "asc" },
    })

    return data.map((book) => Book.fromPersistence(book.id, book.title, book.author, book.available))
  }

  async update(book: Book): Promise<Book> {
    if (!book.id) {
      throw new Error("Cannot update book without ID")
    }

    const data = await this.prisma.book.update({
      where: { id: book.id },
      data: {
        title: book.title,
        author: book.author,
        available: book.available,
      },
    })

    return Book.fromPersistence(data.id, data.title, data.author, data.available)
  }

  async delete(id: number): Promise<void> {
    await this.prisma.book.delete({
      where: { id },
    })
  }

  async findByTitle(title: string): Promise<Book[]> {
    const data = await this.prisma.book.findMany({
      where: {
        title: {
          contains: title,
          mode: "insensitive",
        },
      },
      orderBy: { title: "asc" },
    })

    return data.map((book) => Book.fromPersistence(book.id, book.title, book.author, book.available))
  }

  async findByAuthor(author: string): Promise<Book[]> {
    const data = await this.prisma.book.findMany({
      where: {
        author: {
          contains: author,
          mode: "insensitive",
        },
      },
      orderBy: { title: "asc" },
    })

    return data.map((book) => Book.fromPersistence(book.id, book.title, book.author, book.available))
  }
}
