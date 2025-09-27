import { Global, Module } from "@nestjs/common"
import { DateProviderModule } from "./providers/date-provider.module"

@Global()
@Module({
  imports: [DateProviderModule],
  exports: [DateProviderModule],
})
export class CoreModule {}
