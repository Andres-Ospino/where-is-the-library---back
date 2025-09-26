import { Module } from "@nestjs/common"
import { DateProviderService } from "./date-provider.service"
import { EventBusService } from "./event-bus.service"
import { DATE_PROVIDER_TOKEN } from "@/modules/shared/ports/date-provider.port"
import { EVENT_BUS_TOKEN } from "@/modules/shared/ports/event-bus.port"

@Module({
  providers: [
    {
      provide: DATE_PROVIDER_TOKEN,
      useClass: DateProviderService,
    },
    {
      provide: EVENT_BUS_TOKEN,
      useClass: EventBusService,
    },
  ],
  exports: [DATE_PROVIDER_TOKEN, EVENT_BUS_TOKEN],
})
export class DateProviderModule {}
