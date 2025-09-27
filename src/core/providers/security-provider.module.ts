import { Module } from "@nestjs/common"

import { HashingService } from "./hashing.service"
import { HASHING_SERVICE_TOKEN } from "@/modules/shared/ports/hashing.port"

@Module({
  providers: [
    {
      provide: HASHING_SERVICE_TOKEN,
      useClass: HashingService,
    },
  ],
  exports: [HASHING_SERVICE_TOKEN],
})
export class SecurityProviderModule {}
