import { Module, forwardRef } from "@nestjs/common"
import { BooksController } from "./infrastructure/controllers/books.controller"
import { CreateBookUseCase } from "./application/use-cases/create-book.use-case"
import { ListBooksUseCase } from "./application/use-cases/list-books.use-case"
import { UpdateBookUseCase } from "./application/use-cases/update-book.use-case"
import { RemoveBookUseCase } from "./application/use-cases/remove-book.use-case"
import { PrismaBookRepository } from "./infrastructure/repositories/prisma-book.repository"
import { BOOK_REPOSITORY_TOKEN } from "./domain/ports/book-repository.port"
import { LoansModule } from "@/modules/loans/loans.module"

@Module({
  imports: [forwardRef(() => LoansModule)],
  controllers: [BooksController],
  providers: [
    CreateBookUseCase,
    ListBooksUseCase,
    UpdateBookUseCase,
    RemoveBookUseCase,
    {
      provide: BOOK_REPOSITORY_TOKEN,
      useClass: PrismaBookRepository,
    },
  ],
  exports: [BOOK_REPOSITORY_TOKEN],
})
export class CatalogModule {}
