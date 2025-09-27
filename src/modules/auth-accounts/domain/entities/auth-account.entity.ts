import { ValidationError } from "@/modules/shared/errors/validation.error"

export class AuthAccount {
  private constructor(
    private readonly _id: number | null,
    private readonly _email: string,
    private readonly _passwordHash: string,
  ) {
    this.validateEmail(_email)
    this.validatePasswordHash(_passwordHash)
  }

  static create(email: string, passwordHash: string): AuthAccount {
    return new AuthAccount(null, email, passwordHash)
  }

  static fromPersistence(id: number, email: string, passwordHash: string): AuthAccount {
    return new AuthAccount(id, email, passwordHash)
  }

  get id(): number | null {
    return this._id
  }

  get email(): string {
    return this._email
  }

  get passwordHash(): string {
    return this._passwordHash
  }

  private validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new ValidationError("Auth account email cannot be empty")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format")
    }

    if (email.length > 255) {
      throw new ValidationError("Auth account email cannot exceed 255 characters")
    }
  }

  private validatePasswordHash(passwordHash: string): void {
    if (!passwordHash || passwordHash.trim().length === 0) {
      throw new ValidationError("Auth account password hash cannot be empty")
    }
  }
}
