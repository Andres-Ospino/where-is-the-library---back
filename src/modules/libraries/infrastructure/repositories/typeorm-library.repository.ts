import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Library } from "../../domain/entities/library.entity"
import type { LibraryQueryOptions, LibraryRepositoryPort } from "../../domain/ports/library-repository.port"
import { LibraryOrmEntity } from "../persistence/typeorm/library.orm-entity"
import { Book } from "@/modules/catalog/domain/entities/book.entity"
import { BookOrmEntity } from "@/modules/catalog/infrastructure/persistence/typeorm/book.orm-entity"

@Injectable()
export class TypeormLibraryRepository implements LibraryRepositoryPort {
  constructor(
    @InjectRepository(LibraryOrmEntity)
    private readonly repository: Repository<LibraryOrmEntity>,
  ) {}

  private toDomain(entity: LibraryOrmEntity, includeBooks: boolean): Library {
    const books: Book[] = includeBooks && entity.books
      ? entity.books
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((book) => this.mapBook(book))
      : []

    return Library.fromPersistence(entity.id, entity.name, entity.address, entity.openingHours, books)
  }

  private mapBook(entity: BookOrmEntity): Book {
    return Book.fromPersistence(entity.id, entity.title, entity.author, entity.isbn, entity.available, entity.libraryId)
  }

  async save(library: Library): Promise<Library> {
    const entity = this.repository.create({
      name: library.name,
      address: library.address,
      openingHours: library.openingHours,
    })

    const saved = await this.repository.save(entity)
    return this.toDomain(saved, false)
  }

  async findById(id: number, options?: LibraryQueryOptions): Promise<Library | null> {
    const includeBooks = options?.includeBooks ?? false
    const entity = await this.repository.findOne({
      where: { id },
      relations: includeBooks ? { books: true } : undefined,
      order: includeBooks ? { books: { title: "ASC" } } : undefined,
    })
    return entity ? this.toDomain(entity, includeBooks) : null
  }

  async findAll(options?: LibraryQueryOptions): Promise<Library[]> {
    const includeBooks = options?.includeBooks ?? false
    const entities = await this.repository.find({
      relations: includeBooks ? { books: true } : undefined,
      order: includeBooks
        ? { name: "ASC", books: { title: "ASC" } }
        : { name: "ASC" },
    })
    return entities.map((entity) => this.toDomain(entity, includeBooks))
  }
}
