import type { DomainEvent } from "@/modules/shared/ports/event-bus.port"

export class LoanReturnedEvent implements DomainEvent {
  readonly eventName = "LoanReturned"
  readonly occurredOn: Date

  constructor(
    public readonly loanId: number,
    public readonly bookId: number,
    public readonly memberId: number,
    public readonly returnDate: Date,
  ) {
    this.occurredOn = new Date()
  }

  get eventData(): Record<string, unknown> {
    return {
      loanId: this.loanId,
      bookId: this.bookId,
      memberId: this.memberId,
      returnDate: this.returnDate,
    }
  }
}
