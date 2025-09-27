import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { LoanOrmEntity } from "@/modules/loans/infrastructure/persistence/typeorm/loan.orm-entity"

@Entity({ name: "books" })
@Index(["title"])
@Index(["author"])
@Index(["available"])
export class BookOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 255 })
  title!: string

  @Column({ length: 255 })
  author!: string

  @Column({ default: true })
  available!: boolean

  @OneToMany(() => LoanOrmEntity, (loan) => loan.book)
  loans?: LoanOrmEntity[]

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date
}
