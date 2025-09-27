import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Member } from "../../domain/entities/member.entity"
import type { MemberRepositoryPort } from "../../domain/ports/member-repository.port"
import { MemberOrmEntity } from "../persistence/typeorm/member.orm-entity"

@Injectable()
export class TypeormMemberRepository implements MemberRepositoryPort {
  constructor(
    @InjectRepository(MemberOrmEntity)
    private readonly repository: Repository<MemberOrmEntity>,
  ) {}

  private toDomain(entity: MemberOrmEntity): Member {
    return Member.fromPersistence(entity.id, entity.name, entity.email)
  }

  async save(member: Member): Promise<Member> {
    const entity = this.repository.create({
      name: member.name,
      email: member.email,
    })

    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async findById(id: number): Promise<Member | null> {
    const entity = await this.repository.findOne({ where: { id } })
    return entity ? this.toDomain(entity) : null
  }

  async findAll(): Promise<Member[]> {
    const entities = await this.repository.find({ order: { name: "ASC" } })
    return entities.map((entity) => this.toDomain(entity))
  }

  async findByEmail(email: string): Promise<Member | null> {
    const entity = await this.repository.findOne({ where: { email } })
    return entity ? this.toDomain(entity) : null
  }

  async update(member: Member): Promise<Member> {
    const id = member.id
    if (!id) {
      throw new Error("Cannot update member without ID")
    }

    const entity = await this.repository.preload({
      id,
      name: member.name,
      email: member.email,
    })

    if (!entity) {
      throw new Error(`Member with ID ${id} not found`)
    }

    const saved = await this.repository.save(entity)
    return this.toDomain(saved)
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id })
  }
}
