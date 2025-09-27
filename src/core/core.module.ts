import { Global, Module } from "@nestjs/common"

import { DateProviderModule } from "./providers/date-provider.module"
import { SecurityProviderModule } from "./providers/security-provider.module"
import { DatabaseModule } from "./database/database.module"

@Global()
@Module({
  imports: [DateProviderModule, SecurityProviderModule, DatabaseModule],
  exports: [DateProviderModule, SecurityProviderModule, DatabaseModule],
})
export class CoreModule {}
