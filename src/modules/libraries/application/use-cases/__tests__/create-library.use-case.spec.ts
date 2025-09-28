import { CreateLibraryUseCase } from "../create-library.use-case"
import { Library } from "../../../domain/entities/library.entity"
import type { LibraryRepositoryPort } from "../../../domain/ports/library-repository.port"

describe("CreateLibraryUseCase", () => {
  let useCase: CreateLibraryUseCase
  let mockLibraryRepository: jest.Mocked<LibraryRepositoryPort>

  beforeEach(() => {
    mockLibraryRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<LibraryRepositoryPort>

    useCase = new CreateLibraryUseCase(mockLibraryRepository)
  })

  it("should create a library successfully", async () => {
    const command = {
      name: "Central Library",
      address: "123 Main St",
      openingHours: "Mon-Fri 9-18",
    }

    const expectedLibrary = Library.fromPersistence(1, command.name, command.address, command.openingHours)
    mockLibraryRepository.save.mockResolvedValue(expectedLibrary)

    const result = await useCase.execute(command)

    expect(mockLibraryRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: command.name,
        address: command.address,
        openingHours: command.openingHours,
      }),
    )
    expect(result).toEqual(expectedLibrary)
  })

  it("should throw validation error for empty name", async () => {
    const command = {
      name: "",
      address: "123 Main St",
      openingHours: "Mon-Fri 9-18",
    }

    await expect(useCase.execute(command)).rejects.toThrow("Library name cannot be empty")
  })

  it("should throw validation error for empty address", async () => {
    const command = {
      name: "Central Library",
      address: "",
      openingHours: "Mon-Fri 9-18",
    }

    await expect(useCase.execute(command)).rejects.toThrow("Library address cannot be empty")
  })

  it("should throw validation error for empty opening hours", async () => {
    const command = {
      name: "Central Library",
      address: "123 Main St",
      openingHours: "",
    }

    await expect(useCase.execute(command)).rejects.toThrow("Library opening hours cannot be empty")
  })
})
