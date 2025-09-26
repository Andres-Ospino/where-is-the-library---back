import { Global, Module } from "@nestjs/common"
import { PrismaModule } from "./database/prisma.module"
import { DateProviderModule } from "./providers/date-provider.module"

@Global()
@Module({
  imports: [PrismaModule, DateProviderModule],
  exports: [PrismaModule, DateProviderModule],
})
export class CoreModule {}
