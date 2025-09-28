import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { LibrariesController } from "./infrastructure/controllers/libraries.controller"
import { CreateLibraryUseCase } from "./application/use-cases/create-library.use-case"
import { ListLibrariesUseCase } from "./application/use-cases/list-libraries.use-case"
import { GetLibraryUseCase } from "./application/use-cases/get-library.use-case"
import { LIBRARY_REPOSITORY_TOKEN } from "./domain/ports/library-repository.port"
import { TypeormLibraryRepository } from "./infrastructure/repositories/typeorm-library.repository"
import { LibraryOrmEntity } from "./infrastructure/persistence/typeorm/library.orm-entity"

@Module({
  imports: [TypeOrmModule.forFeature([LibraryOrmEntity])],
  controllers: [LibrariesController],
  providers: [
    CreateLibraryUseCase,
    ListLibrariesUseCase,
    GetLibraryUseCase,
    {
      provide: LIBRARY_REPOSITORY_TOKEN,
      useClass: TypeormLibraryRepository,
    },
  ],
  exports: [LIBRARY_REPOSITORY_TOKEN],
})
export class LibrariesModule {}
