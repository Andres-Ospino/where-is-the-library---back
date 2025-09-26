import type { Member } from "../entities/member.entity"

export const MEMBER_REPOSITORY_TOKEN = Symbol("MemberRepository")

export interface MemberRepositoryPort {
  save(member: Member): Promise<Member>
  findById(id: number): Promise<Member | null>
  findAll(): Promise<Member[]>
  findByEmail(email: string): Promise<Member | null>
  update(member: Member): Promise<Member>
  delete(id: number): Promise<void>
}
