import { ValidationError } from "@/modules/shared/errors/validation.error"

export class Book {
  private readonly _isbn: string
  private readonly _libraryId: number | null

  constructor(
    private readonly _id: number | null,
    private readonly _title: string,
    private readonly _author: string,
    isbn: string,
    private _available: boolean,
    libraryId: number | null,
  ) {
    this.validateTitle(_title)
    this.validateAuthor(_author)
    this._isbn = this.validateIsbn(isbn)
    this._libraryId = this.validateLibraryId(libraryId)
  }

  static create(title: string, author: string, isbn: string, libraryId?: number | null): Book {
    return new Book(null, title, author, isbn, true, libraryId ?? null)
  }

  static fromPersistence(
    id: number,
    title: string,
    author: string,
    isbn: string,
    available: boolean,
    libraryId: number | null,
  ): Book {
    return new Book(id, title, author, isbn, available, libraryId)
  }

  get id(): number | null {
    return this._id
  }

  get title(): string {
    return this._title
  }

  get author(): string {
    return this._author
  }

  get isbn(): string {
    return this._isbn
  }

  get available(): boolean {
    return this._available
  }

  get libraryId(): number | null {
    return this._libraryId
  }

  markAsUnavailable(): void {
    if (!this._available) {
      throw new ValidationError("Book is already unavailable")
    }
    this._available = false
  }

  markAsAvailable(): void {
    if (this._available) {
      throw new ValidationError("Book is already available")
    }
    this._available = true
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new ValidationError("Book title cannot be empty")
    }
    if (title.length > 255) {
      throw new ValidationError("Book title cannot exceed 255 characters")
    }
  }

  private validateAuthor(author: string): void {
    if (!author || author.trim().length === 0) {
      throw new ValidationError("Book author cannot be empty")
    }
    if (author.length > 255) {
      throw new ValidationError("Book author cannot exceed 255 characters")
    }
  }

  private validateIsbn(isbn: string): string {
    if (!isbn || isbn.trim().length === 0) {
      throw new ValidationError("Book ISBN cannot be empty")
    }

    const normalizedIsbn = isbn.trim()
    if (!/^(?:\d{10}|\d{13})$/u.test(normalizedIsbn)) {
      throw new ValidationError("Book ISBN must be a 10 or 13 digit numeric string")
    }
    return normalizedIsbn
  }

  private validateLibraryId(libraryId: number | null | undefined): number | null {
    if (libraryId === null || libraryId === undefined) {
      return null
    }

    if (!Number.isInteger(libraryId) || libraryId <= 0) {
      throw new ValidationError("Library ID must be a positive integer when provided")
    }

    return libraryId
  }
}
