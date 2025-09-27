import { Member } from "../member.entity"
import { ValidationError } from "@/modules/shared/errors/validation.error"

describe("Member entity", () => {
  it("should create a member with valid data", () => {
    const member = Member.create("Ada Lovelace", "ada@example.com")

    expect(member.id).toBeNull()
    expect(member.name).toBe("Ada Lovelace")
    expect(member.email).toBe("ada@example.com")
  })

  it("should throw when name is empty", () => {
    expect(() => Member.create("", "ada@example.com")).toThrow(ValidationError)
    expect(() => Member.create("   ", "ada@example.com")).toThrow(ValidationError)
  })

  it("should throw when name exceeds 255 characters", () => {
    const longName = "a".repeat(256)
    expect(() => Member.create(longName, "ada@example.com")).toThrow(ValidationError)
  })

  it("should throw when email is empty or invalid", () => {
    expect(() => Member.create("Ada", "")).toThrow(ValidationError)
    expect(() => Member.create("Ada", "invalid-email")).toThrow(ValidationError)
    expect(() => Member.create("Ada", "ada@example")).toThrow(ValidationError)
  })

  it("should throw when email exceeds 255 characters", () => {
    const longEmail = `${"a".repeat(246)}@example.com`
    expect(() => Member.create("Ada", longEmail)).toThrow(ValidationError)
  })

  it("should restore a member from persistence", () => {
    const member = Member.fromPersistence(10, "Grace Hopper", "grace@example.com")

    expect(member.id).toBe(10)
    expect(member.name).toBe("Grace Hopper")
    expect(member.email).toBe("grace@example.com")
  })
})
