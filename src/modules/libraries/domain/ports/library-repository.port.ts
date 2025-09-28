import type { Library } from "../entities/library.entity"

export const LIBRARY_REPOSITORY_TOKEN = Symbol("LibraryRepository")

export interface LibraryRepositoryPort {
  save(library: Library): Promise<Library>
  findById(id: number): Promise<Library | null>
  findAll(): Promise<Library[]>
}
