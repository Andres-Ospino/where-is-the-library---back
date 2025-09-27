import { Global, Module } from "@nestjs/common"
import { DateProviderModule } from "./providers/date-provider.module"
import { DatabaseModule } from "./database/database.module"

@Global()
@Module({
  imports: [DateProviderModule, DatabaseModule],
  exports: [DateProviderModule, DatabaseModule],
})
export class CoreModule {}
