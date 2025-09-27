import { ValidationError } from "@/modules/shared/errors/validation.error"

export class Member {
  constructor(
    private readonly _id: number | null,
    private readonly _name: string,
    private readonly _email: string,
  ) {
    this.validateName(_name)
    this.validateEmail(_email)
  }

  static create(name: string, email: string): Member {
    return new Member(null, name, email)
  }

  static fromPersistence(id: number, name: string, email: string): Member {
    return new Member(id, name, email)
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
}
