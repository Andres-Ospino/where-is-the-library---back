export const EVENT_BUS_TOKEN = Symbol("EventBus")

export interface DomainEvent {
  eventName: string
  occurredOn: Date
  eventData: Record<string, unknown>
}

export interface EventBusPort {
  publish(event: DomainEvent): Promise<void>
}
