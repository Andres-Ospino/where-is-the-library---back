import { Injectable } from "@nestjs/common"
import type { DateProviderPort } from "@/modules/shared/ports/date-provider.port"

@Injectable()
export class DateProviderService implements DateProviderPort {
  now(): Date {
    return new Date()
  }
}
