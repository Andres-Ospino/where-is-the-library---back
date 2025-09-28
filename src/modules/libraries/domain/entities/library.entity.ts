import { Book } from "@/modules/catalog/domain/entities/book.entity"
import { ValidationError } from "@/modules/shared/errors/validation.error"

export class Library {
  constructor(
    private readonly _id: number | null,
    private readonly _name: string,
    private readonly _address: string,
    private readonly _openingHours: string,
    private readonly _books: Book[] = [],
  ) {
    this.validateName(_name)
    this.validateAddress(_address)
    this.validateOpeningHours(_openingHours)
  }

  static create(name: string, address: string, openingHours: string): Library {
    return new Library(null, name, address, openingHours, [])
  }

  static fromPersistence(
    id: number,
    name: string,
    address: string,
    openingHours: string,
    books: Book[] = [],
  ): Library {
    return new Library(id, name, address, openingHours, books)
  }

  get id(): number | null {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get address(): string {
    return this._address
  }

  get openingHours(): string {
    return this._openingHours
  }

  get books(): Book[] {
    return this._books
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Library name cannot be empty")
    }
    if (name.length > 255) {
      throw new ValidationError("Library name cannot exceed 255 characters")
    }
  }

  private validateAddress(address: string): void {
    if (!address || address.trim().length === 0) {
      throw new ValidationError("Library address cannot be empty")
    }
    if (address.length > 255) {
      throw new ValidationError("Library address cannot exceed 255 characters")
    }
  }

  private validateOpeningHours(openingHours: string): void {
    if (!openingHours || openingHours.trim().length === 0) {
      throw new ValidationError("Library opening hours cannot be empty")
    }
    if (openingHours.length > 255) {
      throw new ValidationError("Library opening hours cannot exceed 255 characters")
    }
  }
}
