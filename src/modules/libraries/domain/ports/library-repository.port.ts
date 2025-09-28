import type { Library } from "../entities/library.entity"

export const LIBRARY_REPOSITORY_TOKEN = Symbol("LibraryRepository")

export interface LibraryQueryOptions {
  includeBooks?: boolean
}

export interface LibraryRepositoryPort {
  save(library: Library): Promise<Library>
  findById(id: number, options?: LibraryQueryOptions): Promise<Library | null>
  findAll(options?: LibraryQueryOptions): Promise<Library[]>
}
