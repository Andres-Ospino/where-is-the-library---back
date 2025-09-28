import { Book } from "../book.entity"
import { ValidationError } from "@/modules/shared/errors/validation.error"

describe("Book Entity", () => {
  describe("create", () => {
    it("should create a book with valid data", () => {
      // Act
      const book = Book.create("The Great Gatsby", "F. Scott Fitzgerald", "1234567890")

      // Assert
      expect(book.title).toBe("The Great Gatsby")
      expect(book.author).toBe("F. Scott Fitzgerald")
      expect(book.available).toBe(true)
      expect(book.isbn).toBe("1234567890")
      expect(book.id).toBeNull()
    })

    it("should throw ValidationError for empty title", () => {
      // Act & Assert
      expect(() => Book.create("", "F. Scott Fitzgerald", "1234567890")).toThrow(ValidationError)
      expect(() => Book.create("", "F. Scott Fitzgerald", "1234567890")).toThrow("Book title cannot be empty")
    })

    it("should throw ValidationError for empty author", () => {
      // Act & Assert
      expect(() => Book.create("The Great Gatsby", "", "1234567890")).toThrow(ValidationError)
      expect(() => Book.create("The Great Gatsby", "", "1234567890")).toThrow("Book author cannot be empty")
    })

    it("should throw ValidationError for title too long", () => {
      // Arrange
      const longTitle = "a".repeat(256)

      // Act & Assert
      expect(() => Book.create(longTitle, "Author", "1234567890")).toThrow(ValidationError)
      expect(() => Book.create(longTitle, "Author", "1234567890")).toThrow("Book title cannot exceed 255 characters")

      expect(() => Book.create("Valid Title", "Valid Author", "")).toThrow(ValidationError)
      expect(() => Book.create("Valid Title", "Valid Author", "")).toThrow("Book ISBN cannot be empty")

      expect(() => Book.create("Valid Title", "Valid Author", "INVALIDISBN")).toThrow(ValidationError)
      expect(() => Book.create("Valid Title", "Valid Author", "INVALIDISBN")).toThrow(
        "Book ISBN must be a 10 or 13 digit numeric string",
      )

      expect(() => Book.create("Valid Title", "Valid Author", "123456789012")).toThrow(ValidationError)
      expect(() => Book.create("Valid Title", "Valid Author", "123456789012")).toThrow(
        "Book ISBN must be a 10 or 13 digit numeric string",
      )
    })
  })

  describe("markAsUnavailable", () => {
    it("should mark available book as unavailable", () => {
      // Arrange
      const book = Book.create("Test Book", "Test Author", "1234567890")

      // Act
      book.markAsUnavailable()

      // Assert
      expect(book.available).toBe(false)
    })

    it("should throw ValidationError when book is already unavailable", () => {
      // Arrange
      const book = Book.fromPersistence(1, "Test Book", "Test Author", "1234567890", false)

      // Act & Assert
      expect(() => book.markAsUnavailable()).toThrow(ValidationError)
      expect(() => book.markAsUnavailable()).toThrow("Book is already unavailable")
    })
  })

  describe("markAsAvailable", () => {
    it("should mark unavailable book as available", () => {
      // Arrange
      const book = Book.fromPersistence(1, "Test Book", "Test Author", "1234567890", false)

      // Act
      book.markAsAvailable()

      // Assert
      expect(book.available).toBe(true)
    })

    it("should throw ValidationError when book is already available", () => {
      // Arrange
      const book = Book.create("Test Book", "Test Author", "1234567890")

      // Act & Assert
      expect(() => book.markAsAvailable()).toThrow(ValidationError)
      expect(() => book.markAsAvailable()).toThrow("Book is already available")
    })
  })
})
