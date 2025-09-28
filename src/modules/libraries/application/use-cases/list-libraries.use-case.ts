import { Inject, Injectable } from "@nestjs/common"
import { LIBRARY_REPOSITORY_TOKEN, type LibraryRepositoryPort } from "../../domain/ports/library-repository.port"
import { Library } from "../../domain/entities/library.entity"

@Injectable()
export class ListLibrariesUseCase {
  constructor(
    @Inject(LIBRARY_REPOSITORY_TOKEN)
    private readonly libraryRepository: LibraryRepositoryPort,
  ) {}

  async execute(): Promise<Library[]> {
    return await this.libraryRepository.findAll()
  }
}
