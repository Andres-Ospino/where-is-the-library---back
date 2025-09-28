import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { LoanOrmEntity } from "@/modules/loans/infrastructure/persistence/typeorm/loan.orm-entity"

@Entity({ name: "members" })
@Index(["email"], { unique: true })
export class MemberOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 255 })
  name!: string

  @Column({ length: 255, unique: true })
  email!: string

  @Column({ length: 20 })
  phone!: string

  @OneToMany(() => LoanOrmEntity, (loan) => loan.member)
  loans?: LoanOrmEntity[]

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date
}
