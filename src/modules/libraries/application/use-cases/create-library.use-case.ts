import { Inject, Injectable } from "@nestjs/common"
import { Library } from "../../domain/entities/library.entity"
import { LIBRARY_REPOSITORY_TOKEN, type LibraryRepositoryPort } from "../../domain/ports/library-repository.port"

export interface CreateLibraryCommand {
  name: string
  address: string
  openingHours: string
}

@Injectable()
export class CreateLibraryUseCase {
  constructor(
    @Inject(LIBRARY_REPOSITORY_TOKEN)
    private readonly libraryRepository: LibraryRepositoryPort,
  ) {}

  async execute(command: CreateLibraryCommand): Promise<Library> {
    const library = Library.create(command.name, command.address, command.openingHours)
    return await this.libraryRepository.save(library)
  }
}
