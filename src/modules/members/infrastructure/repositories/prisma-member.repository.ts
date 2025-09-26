import { Injectable } from "@nestjs/common"
import type { PrismaService } from "@/core/database/prisma.service"
import { Member } from "../../domain/entities/member.entity"
import type { MemberRepositoryPort } from "../../domain/ports/member-repository.port"

@Injectable()
export class PrismaMemberRepository implements MemberRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(member: Member): Promise<Member> {
    const data = await this.prisma.member.create({
      data: {
        name: member.name,
        email: member.email,
      },
    })

    return Member.fromPersistence(data.id, data.name, data.email)
  }

  async findById(id: number): Promise<Member | null> {
    const data = await this.prisma.member.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return Member.fromPersistence(data.id, data.name, data.email)
  }

  async findAll(): Promise<Member[]> {
    const data = await this.prisma.member.findMany({
      orderBy: { name: "asc" },
    })

    return data.map((member) => Member.fromPersistence(member.id, member.name, member.email))
  }

  async findByEmail(email: string): Promise<Member | null> {
    const data = await this.prisma.member.findUnique({
      where: { email },
    })

    if (!data) {
      return null
    }

    return Member.fromPersistence(data.id, data.name, data.email)
  }

  async update(member: Member): Promise<Member> {
    if (!member.id) {
      throw new Error("Cannot update member without ID")
    }

    const data = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        name: member.name,
        email: member.email,
      },
    })

    return Member.fromPersistence(data.id, data.name, data.email)
  }

  async delete(id: number): Promise<void> {
    await this.prisma.member.delete({
      where: { id },
    })
  }
}
