import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Library } from "../../domain/entities/library.entity"
import type { LibraryRepositoryPort } from "../../domain/ports/library-repository.port"
import { LibraryOrmEntity } from "../persistence/typeorm/library.orm-entity"

@Injectable()
export class TypeormLibraryRepository implements LibraryRepositoryPort {
  constructor(
    @InjectRepository(LibraryOrmEntity)
    private readonly repository: Repository<LibraryOrmEntity>,
  ) {}

  private toDomain(entity: LibraryOrmEntity): Library {
    return Library.fromPersistence(entity.id, entity.name, entity.address, entity.openingHours)
  }

  async save(library: Library): Promise<Library> {
    const entity = this.repository.create({
      name: library.name,
      address: library.address,
      openingHours: library.openingHours,
    })

    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async findById(id: number): Promise<Library | null> {
    const entity = await this.repository.findOne({ where: { id } })
    return entity ? this.toDomain(entity) : null
  }

  async findAll(): Promise<Library[]> {
    const entities = await this.repository.find({ order: { name: "ASC" } })
    return entities.map((entity) => this.toDomain(entity))
  }
}
