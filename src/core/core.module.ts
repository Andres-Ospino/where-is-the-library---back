import { Global, Module } from "@nestjs/common"

import { DateProviderModule } from "./providers/date-provider.module"
import { SecurityProviderModule } from "./providers/security-provider.module"

@Global()
@Module({
  imports: [DateProviderModule, SecurityProviderModule],
  exports: [DateProviderModule, SecurityProviderModule],
})
export class CoreModule {}
