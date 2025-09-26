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
    }

    useCase = new CreateBookUseCase(mockBookRepository)
  })

  it("should create a book successfully", async () => {
    // Arrange
    const command = {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
    }

    const expectedBook = Book.fromPersistence(1, command.title, command.author, true)
    mockBookRepository.save.mockResolvedValue(expectedBook)

    // Act
    const result = await useCase.execute(command)

    // Assert
    expect(mockBookRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: command.title,
        author: command.author,
        available: true,
      }),
    )
    expect(result).toEqual(expectedBook)
  })

  it("should throw validation error for empty title", async () => {
    // Arrange
    const command = {
      title: "",
      author: "F. Scott Fitzgerald",
    }

    // Act & Assert
    await expect(useCase.execute(command)).rejects.toThrow("Book title cannot be empty")
  })

  it("should throw validation error for empty author", async () => {
    // Arrange
    const command = {
      title: "The Great Gatsby",
      author: "",
    }

    // Act & Assert
    await expect(useCase.execute(command)).rejects.toThrow("Book author cannot be empty")
  })
})
