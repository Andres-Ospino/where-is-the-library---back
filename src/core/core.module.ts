import { Global, Module } from "@nestjs/common"
<<<<<<< HEAD

import { DateProviderModule } from "./providers/date-provider.module"
import { SecurityProviderModule } from "./providers/security-provider.module"

@Global()
@Module({
  imports: [DateProviderModule, SecurityProviderModule],
  exports: [DateProviderModule, SecurityProviderModule],
=======
import { DateProviderModule } from "./providers/date-provider.module"
import { DatabaseModule } from "./database/database.module"

@Global()
@Module({
  imports: [DateProviderModule, DatabaseModule],
  exports: [DateProviderModule, DatabaseModule],
>>>>>>> origin/codex/remove-prisma-ldugxq
})
export class CoreModule {}
