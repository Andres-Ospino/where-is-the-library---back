import { DomainError } from "./domain.error"

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string | number) {
    super(`${resource} with id ${id} not found`)
  }
}
