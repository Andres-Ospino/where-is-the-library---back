import { Module, forwardRef } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BooksController } from "./infrastructure/controllers/books.controller"
import { CreateBookUseCase } from "./application/use-cases/create-book.use-case"
import { ListBooksUseCase } from "./application/use-cases/list-books.use-case"
import { UpdateBookUseCase } from "./application/use-cases/update-book.use-case"
import { RemoveBookUseCase } from "./application/use-cases/remove-book.use-case"
<<<<<<< HEAD
import { InMemoryBookRepository } from "./infrastructure/repositories/in-memory-book.repository"
=======
>>>>>>> origin/codex/remove-prisma-ldugxq
import { BOOK_REPOSITORY_TOKEN } from "./domain/ports/book-repository.port"
import { LoansModule } from "@/modules/loans/loans.module"
import { TypeormBookRepository } from "./infrastructure/repositories/typeorm-book.repository"
import { BookOrmEntity } from "./infrastructure/persistence/typeorm/book.orm-entity"

@Module({
  imports: [forwardRef(() => LoansModule), TypeOrmModule.forFeature([BookOrmEntity])],
  controllers: [BooksController],
  providers: [
    CreateBookUseCase,
    ListBooksUseCase,
    UpdateBookUseCase,
    RemoveBookUseCase,
    {
      provide: BOOK_REPOSITORY_TOKEN,
<<<<<<< HEAD
      useClass: InMemoryBookRepository,
=======
      useClass: TypeormBookRepository,
>>>>>>> origin/codex/remove-prisma-ldugxq
    },
  ],
  exports: [BOOK_REPOSITORY_TOKEN],
})
export class CatalogModule {}
