import { NotFoundException } from "@nestjs/common"
import { GetLibraryUseCase } from "../get-library.use-case"
import { Library } from "../../../domain/entities/library.entity"
import type { LibraryRepositoryPort } from "../../../domain/ports/library-repository.port"

describe("GetLibraryUseCase", () => {
  let useCase: GetLibraryUseCase
  let mockLibraryRepository: jest.Mocked<LibraryRepositoryPort>

  beforeEach(() => {
    mockLibraryRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<LibraryRepositoryPort>

    useCase = new GetLibraryUseCase(mockLibraryRepository)
  })

  it("should return a library when it exists", async () => {
    const library = Library.fromPersistence(1, "Central Library", "123 Main St", "Mon-Fri 9-18")
    mockLibraryRepository.findById.mockResolvedValue(library)

    const result = await useCase.execute({ id: 1 })

    expect(mockLibraryRepository.findById).toHaveBeenCalledWith(1, { includeBooks: true })
    expect(result).toBe(library)
  })

  it("should throw NotFoundException when library does not exist", async () => {
    mockLibraryRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute({ id: 1 })).rejects.toThrow(NotFoundException)
    await expect(useCase.execute({ id: 1 })).rejects.toThrow("Library with ID 1 not found")
  })
})
