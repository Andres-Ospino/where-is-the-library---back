import { ListLibrariesUseCase } from "../list-libraries.use-case"
import { Library } from "../../../domain/entities/library.entity"
import type { LibraryRepositoryPort } from "../../../domain/ports/library-repository.port"

describe("ListLibrariesUseCase", () => {
  let useCase: ListLibrariesUseCase
  let mockLibraryRepository: jest.Mocked<LibraryRepositoryPort>

  beforeEach(() => {
    mockLibraryRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<LibraryRepositoryPort>

    useCase = new ListLibrariesUseCase(mockLibraryRepository)
  })

  it("should list libraries", async () => {
    const libraries = [
      Library.fromPersistence(1, "Central Library", "123 Main St", "Mon-Fri 9-18"),
      Library.fromPersistence(2, "East Branch", "456 Oak Ave", "Mon-Sat 10-17"),
    ]
    mockLibraryRepository.findAll.mockResolvedValue(libraries)

    const result = await useCase.execute()

    expect(mockLibraryRepository.findAll).toHaveBeenCalledWith({ includeBooks: true })
    expect(result).toEqual(libraries)
  })
})
