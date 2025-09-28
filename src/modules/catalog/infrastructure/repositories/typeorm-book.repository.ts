import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { ILike, Like, Repository } from "typeorm"
import { Book } from "../../domain/entities/book.entity"
import type { BookRepositoryPort } from "../../domain/ports/book-repository.port"
import { BookOrmEntity } from "../persistence/typeorm/book.orm-entity"

@Injectable()
export class TypeormBookRepository implements BookRepositoryPort {
  constructor(
    @InjectRepository(BookOrmEntity)
    private readonly repository: Repository<BookOrmEntity>,
  ) {}

  private isPostgres(): boolean {
    return this.repository.manager.connection.options.type === "postgres"
  }

  private toDomain(entity: BookOrmEntity): Book {
    return Book.fromPersistence(entity.id, entity.title, entity.author, entity.isbn, entity.available)
  }

  async save(book: Book): Promise<Book> {
    const entity = this.repository.create({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      available: book.available,
    })

    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async findById(id: number): Promise<Book | null> {
    const entity = await this.repository.findOne({ where: { id } })
    return entity ? this.toDomain(entity) : null
  }

  async findAll(): Promise<Book[]> {
    const entities = await this.repository.find({ order: { title: "ASC" } })
    return entities.map((entity) => this.toDomain(entity))
  }

  async update(book: Book): Promise<Book> {
    const id = book.id
    if (!id) {
      throw new Error("Cannot update book without ID")
    }

    const entity = await this.repository.preload({
      id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      available: book.available,
    })

    if (!entity) {
      throw new Error(`Book with ID ${id} not found`)
    }

    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id })
  }

  async findByTitle(title: string): Promise<Book[]> {
    const operator = this.isPostgres() ? ILike : Like
    const entities = await this.repository.find({
      where: { title: operator(`%${title}%`) },
      order: { title: "ASC" },
    })

    return entities.map((entity) => this.toDomain(entity))
  }

  async findByAuthor(author: string): Promise<Book[]> {
    const operator = this.isPostgres() ? ILike : Like
    const entities = await this.repository.find({
      where: { author: operator(`%${author}%`) },
      order: { title: "ASC" },
    })

    return entities.map((entity) => this.toDomain(entity))
  }
}
