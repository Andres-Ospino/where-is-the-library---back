import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { LIBRARY_REPOSITORY_TOKEN, type LibraryRepositoryPort } from "../../domain/ports/library-repository.port"
import { Library } from "../../domain/entities/library.entity"

export interface GetLibraryQuery {
  id: number
}

@Injectable()
export class GetLibraryUseCase {
  constructor(
    @Inject(LIBRARY_REPOSITORY_TOKEN)
    private readonly libraryRepository: LibraryRepositoryPort,
  ) {}

  async execute(query: GetLibraryQuery): Promise<Library> {
    const library = await this.libraryRepository.findById(query.id, { includeBooks: true })
    if (!library) {
      throw new NotFoundException(`Library with ID ${query.id} not found`)
    }
    return library
  }
}
