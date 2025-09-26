export const DATE_PROVIDER_TOKEN = Symbol("DateProvider")

export interface DateProviderPort {
  now(): Date
}
