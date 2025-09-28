import { CreateBookUseCase } from "../create-book.use-case"
import { Book } from "../../../domain/entities/book.entity"
import type { BookRepositoryPort } from "../../../domain/ports/book-repository.port"

describe("CreateBookUseCase", () => {
  let useCase: CreateBookUseCase
  let mockBookRepository: jest.Mocked<BookRepositoryPort>

  beforeEach(() => {
    mockBookRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByTitle: jest.fn(),
      findByAuthor: jest.fn(),
    } as unknown as jest.Mocked<BookRepositoryPort>

    useCase = new CreateBookUseCase(mockBookRepository)
  })

  it("should create a book successfully", async () => {
    // Arrange
    const command = {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "1234567890",
      libraryId: 1,
    }

    const expectedBook = Book.fromPersistence(1, command.title, command.author, command.isbn, true, command.libraryId)
    mockBookRepository.save.mockResolvedValue(expectedBook)

    // Act
    const result = await useCase.execute(command)

    // Assert
    expect(mockBookRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: command.title,
        author: command.author,
        isbn: command.isbn,
        available: true,
        libraryId: command.libraryId,
      }),
    )
    expect(result).toEqual(expectedBook)
  })

  it("should throw validation error for empty title", async () => {
    // Arrange
    const command = {
      title: "",
      author: "F. Scott Fitzgerald",
      isbn: "1234567890",
    }

    // Act & Assert
    await expect(useCase.execute(command)).rejects.toThrow("Book title cannot be empty")
  })

  it("should throw validation error for empty author", async () => {
    // Arrange
    const command = {
      title: "The Great Gatsby",
      author: "",
      isbn: "1234567890",
    }

    // Act & Assert
    await expect(useCase.execute(command)).rejects.toThrow("Book author cannot be empty")
  })

  it("should throw validation error for invalid isbn", async () => {
    const command = {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "invalid",
    }

    await expect(useCase.execute(command)).rejects.toThrow("Book ISBN must be a 10 or 13 digit numeric string")
  })
})
