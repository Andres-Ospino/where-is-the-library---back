import type { DomainEvent } from "@/modules/shared/ports/event-bus.port"

export class LoanCreatedEvent implements DomainEvent {
  readonly eventName = "LoanCreated"
  readonly occurredOn: Date

  constructor(
    public readonly loanId: number,
    public readonly bookId: number,
    public readonly memberId: number,
    public readonly loanDate: Date,
  ) {
    this.occurredOn = new Date()
  }

  get eventData(): Record<string, unknown> {
    return {
      loanId: this.loanId,
      bookId: this.bookId,
      memberId: this.memberId,
      loanDate: this.loanDate,
    }
  }
}
