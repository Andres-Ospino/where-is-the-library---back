import { ValidationError } from "@/modules/shared/errors/validation.error"

export class Member {
  constructor(
    private readonly _id: number | null,
    private readonly _name: string,
    private readonly _email: string,
    private readonly _passwordHash: string,
  ) {
    this.validateName(_name)
    this.validateEmail(_email)
    this.validatePasswordHash(_passwordHash)
  }

  static create(name: string, email: string, passwordHash: string): Member {
    return new Member(null, name, email, passwordHash)
  }

  static fromPersistence(id: number, name: string, email: string, passwordHash: string): Member {
    return new Member(id, name, email, passwordHash)
  }

  get id(): number | null {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get email(): string {
    return this._email
  }

  get passwordHash(): string {
    return this._passwordHash
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Member name cannot be empty")
    }
    if (name.length > 255) {
      throw new ValidationError("Member name cannot exceed 255 characters")
    }
  }

  private validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new ValidationError("Member email cannot be empty")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format")
    }

    if (email.length > 255) {
      throw new ValidationError("Member email cannot exceed 255 characters")
    }
  }

  private validatePasswordHash(passwordHash: string): void {
    if (!passwordHash || passwordHash.trim().length === 0) {
      throw new ValidationError("Member password hash cannot be empty")
    }
  }
}
