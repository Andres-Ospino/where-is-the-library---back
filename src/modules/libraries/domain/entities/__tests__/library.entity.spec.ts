import { Library } from "../library.entity"
import { ValidationError } from "@/modules/shared/errors/validation.error"

describe("Library Entity", () => {
  describe("create", () => {
    it("should create a library with valid data", () => {
      const library = Library.create("Central Library", "123 Main St", "Mon-Fri 9-18")

      expect(library.id).toBeNull()
      expect(library.name).toBe("Central Library")
      expect(library.address).toBe("123 Main St")
      expect(library.openingHours).toBe("Mon-Fri 9-18")
    })

    it("should throw ValidationError for empty name", () => {
      expect(() => Library.create("", "123 Main St", "Mon-Fri 9-18")).toThrow(ValidationError)
      expect(() => Library.create("", "123 Main St", "Mon-Fri 9-18")).toThrow("Library name cannot be empty")
    })

    it("should throw ValidationError for empty address", () => {
      expect(() => Library.create("Central Library", "", "Mon-Fri 9-18")).toThrow(ValidationError)
      expect(() => Library.create("Central Library", "", "Mon-Fri 9-18")).toThrow("Library address cannot be empty")
    })

    it("should throw ValidationError for empty opening hours", () => {
      expect(() => Library.create("Central Library", "123 Main St", "")).toThrow(ValidationError)
      expect(() => Library.create("Central Library", "123 Main St", "")).toThrow("Library opening hours cannot be empty")
    })
  })
})
