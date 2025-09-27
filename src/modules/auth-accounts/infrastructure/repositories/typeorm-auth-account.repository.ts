import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

import { AuthAccount } from "../../domain/entities/auth-account.entity"
import type { AuthAccountRepositoryPort } from "../../domain/ports/auth-account-repository.port"
import { AuthAccountOrmEntity } from "../persistence/typeorm/auth-account.orm-entity"

@Injectable()
export class TypeormAuthAccountRepository implements AuthAccountRepositoryPort {
  constructor(
    @InjectRepository(AuthAccountOrmEntity)
    private readonly repository: Repository<AuthAccountOrmEntity>,
  ) {}

  private toDomain(entity: AuthAccountOrmEntity): AuthAccount {
    return AuthAccount.fromPersistence(entity.id, entity.email, entity.passwordHash)
  }

  async findByEmail(email: string): Promise<AuthAccount | null> {
    const entity = await this.repository.findOne({ where: { email } })
    return entity ? this.toDomain(entity) : null
  }

  async save(account: AuthAccount): Promise<AuthAccount> {
    const entity = this.repository.create({
      ...(account.id ? { id: account.id } : {}),
      email: account.email,
      passwordHash: account.passwordHash,
    })

    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }
}
