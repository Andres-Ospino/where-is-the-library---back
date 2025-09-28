import { ValidationError } from "@/modules/shared/errors/validation.error"

export class Member {
  constructor(
    private readonly _id: number | null,
    private readonly _name: string,
    private readonly _email: string,
    private readonly _phone: string,
  ) {
    this.validateName(_name)
    this.validateEmail(_email)
    this.validatePhone(_phone)
  }

  static create(name: string, email: string, phone: string): Member {
    return new Member(null, name, email, phone)
  }

  static fromPersistence(id: number, name: string, email: string, phone: string): Member {
    return new Member(id, name, email, phone)
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

  get phone(): string {
    return this._phone
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

  private validatePhone(phone: string): void {
    if (!phone || phone.trim().length === 0) {
      throw new ValidationError("Member phone cannot be empty")
    }

    if (phone.length > 20) {
      throw new ValidationError("Member phone cannot exceed 20 characters")
    }

    const phoneRegex = /^[0-9+()\-\s]{7,20}$/
    if (!phoneRegex.test(phone)) {
      throw new ValidationError("Invalid phone format")
    }
  }
}
