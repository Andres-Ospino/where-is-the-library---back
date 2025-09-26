import { Book } from "../book.entity"
import { ValidationError } from "@/modules/shared/errors/validation.error"

describe("Book Entity", () => {
  describe("create", () => {
    it("should create a book with valid data", () => {
      // Act
      const book = Book.create("The Great Gatsby", "F. Scott Fitzgerald")

      // Assert
      expect(book.title).toBe("The Great Gatsby")
      expect(book.author).toBe("F. Scott Fitzgerald")
      expect(book.available).toBe(true)
      expect(book.id).toBeNull()
    })

    it("should throw ValidationError for empty title", () => {
      // Act & Assert
      expect(() => Book.create("", "F. Scott Fitzgerald")).toThrow(ValidationError)
      expect(() => Book.create("", "F. Scott Fitzgerald")).toThrow("Book title cannot be empty")
    })

    it("should throw ValidationError for empty author", () => {
      // Act & Assert
      expect(() => Book.create("The Great Gatsby", "")).toThrow(ValidationError)
      expect(() => Book.create("The Great Gatsby", "")).toThrow("Book author cannot be empty")
    })

    it("should throw ValidationError for title too long", () => {
      // Arrange
      const longTitle = "a".repeat(256)

      // Act & Assert
      expect(() => Book.create(longTitle, "Author")).toThrow(ValidationError)
      expect(() => Book.create(longTitle, "Author")).toThrow("Book title cannot exceed 255 characters")
    })
  })

  describe("markAsUnavailable", () => {
    it("should mark available book as unavailable", () => {
      // Arrange
      const book = Book.create("Test Book", "Test Author")

      // Act
      book.markAsUnavailable()

      // Assert
      expect(book.available).toBe(false)
    })

    it("should throw ValidationError when book is already unavailable", () => {
      // Arrange
      const book = Book.fromPersistence(1, "Test Book", "Test Author", false)

      // Act & Assert
      expect(() => book.markAsUnavailable()).toThrow(ValidationError)
      expect(() => book.markAsUnavailable()).toThrow("Book is already unavailable")
    })
  })

  describe("markAsAvailable", () => {
    it("should mark unavailable book as available", () => {
      // Arrange
      const book = Book.fromPersistence(1, "Test Book", "Test Author", false)

      // Act
      book.markAsAvailable()

      // Assert
      expect(book.available).toBe(true)
    })

    it("should throw ValidationError when book is already available", () => {
      // Arrange
      const book = Book.create("Test Book", "Test Author")

      // Act & Assert
      expect(() => book.markAsAvailable()).toThrow(ValidationError)
      expect(() => book.markAsAvailable()).toThrow("Book is already available")
    })
  })
})
