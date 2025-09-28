import { ApiProperty } from "@nestjs/swagger"

import type { Member } from "@/modules/members/domain/entities/member.entity"

export class MemberResponseDto {
  @ApiProperty({ example: 3, description: "Identificador único del miembro", nullable: true })
  id!: number | null

  @ApiProperty({ example: "Juana Pérez", description: "Nombre completo del miembro" })
  name!: string

  @ApiProperty({ example: "juana.perez@example.com", description: "Correo electrónico del miembro" })
  email!: string

  @ApiProperty({ example: "+34 600 123 456", description: "Número de contacto del miembro" })
  phone!: string

  static fromEntity(member: Member): MemberResponseDto {
    const dto = new MemberResponseDto()
    dto.id = member.id
    dto.name = member.name
    dto.email = member.email
    dto.phone = member.phone
    return dto
  }
}
