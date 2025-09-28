import { Injectable } from "@nestjs/common"

import { Member } from "../../domain/entities/member.entity"
import type { MemberRepositoryPort } from "../../domain/ports/member-repository.port"

interface MemberRecord {
  id: number
  name: string
  email: string
  phone: string
}

@Injectable()
export class InMemoryMemberRepository implements MemberRepositoryPort {
  private members: MemberRecord[] = []
  private nextId = 1

  async save(member: Member): Promise<Member> {
    const record: MemberRecord = {
      id: this.nextId++,
      name: member.name,
      email: member.email,
      phone: member.phone,
    }

    this.members.push(record)

    return Member.fromPersistence(record.id, record.name, record.email, record.phone)
  }

  async findById(id: number): Promise<Member | null> {
    const record = this.members.find((member) => member.id === id)
    if (!record) {
      return null
    }

    return Member.fromPersistence(record.id, record.name, record.email, record.phone)
  }

  async findAll(): Promise<Member[]> {
    return this.members
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((record) => Member.fromPersistence(record.id, record.name, record.email, record.phone))
  }

  async findByEmail(email: string): Promise<Member | null> {
    const record = this.members.find((member) => member.email === email)
    if (!record) {
      return null
    }

    return Member.fromPersistence(record.id, record.name, record.email, record.phone)
  }

  async update(member: Member): Promise<Member> {
    const id = member.id
    if (!id) {
      throw new Error("Cannot update member without ID")
    }

    const index = this.members.findIndex((record) => record.id === id)
    if (index === -1) {
      throw new Error(`Member with ID ${id} not found`)
    }

    const updated: MemberRecord = {
      id,
      name: member.name,
      email: member.email,
      phone: member.phone,
    }

    this.members[index] = updated

    return Member.fromPersistence(updated.id, updated.name, updated.email, updated.phone)
  }

  async delete(id: number): Promise<void> {
    this.members = this.members.filter((member) => member.id !== id)
  }

  clear(): void {
    this.members = []
    this.nextId = 1
  }
}
