import { Member } from "../member.entity"
import { ValidationError } from "@/modules/shared/errors/validation.error"

describe("Member entity", () => {
  it("should create a member with valid data", () => {
    const member = Member.create("Ada Lovelace", "ada@example.com", "+44123456789")

    expect(member.id).toBeNull()
    expect(member.name).toBe("Ada Lovelace")
    expect(member.email).toBe("ada@example.com")
    expect(member.phone).toBe("+44123456789")
  })

  it("should throw when name is empty", () => {
    expect(() => Member.create("", "ada@example.com", "+44123456789")).toThrow(ValidationError)
    expect(() => Member.create("   ", "ada@example.com", "+44123456789")).toThrow(ValidationError)
  })

  it("should throw when name exceeds 255 characters", () => {
    const longName = "a".repeat(256)
    expect(() => Member.create(longName, "ada@example.com", "+44123456789")).toThrow(ValidationError)
  })

  it("should throw when email is empty or invalid", () => {
    expect(() => Member.create("Ada", "", "+44123456789")).toThrow(ValidationError)
    expect(() => Member.create("Ada", "invalid-email", "+44123456789")).toThrow(ValidationError)
    expect(() => Member.create("Ada", "ada@example", "+44123456789")).toThrow(ValidationError)
  })

  it("should throw when email exceeds 255 characters", () => {
    const longEmail = `${"a".repeat(246)}@example.com`
    expect(() => Member.create("Ada", longEmail, "+44123456789")).toThrow(ValidationError)
  })

  it("should throw when phone is empty or invalid", () => {
    expect(() => Member.create("Ada", "ada@example.com", "")).toThrow(ValidationError)
    expect(() => Member.create("Ada", "ada@example.com", "123")).toThrow(ValidationError)
    expect(() => Member.create("Ada", "ada@example.com", "phone123")).toThrow(ValidationError)
  })

  it("should throw when phone exceeds 20 characters", () => {
    const longPhone = "+" + "1".repeat(20)
    expect(() => Member.create("Ada", "ada@example.com", longPhone)).toThrow(ValidationError)
  })

  it("should restore a member from persistence", () => {
    const member = Member.fromPersistence(10, "Grace Hopper", "grace@example.com", "+33123456789")

    expect(member.id).toBe(10)
    expect(member.name).toBe("Grace Hopper")
    expect(member.email).toBe("grace@example.com")
    expect(member.phone).toBe("+33123456789")
  })
})
