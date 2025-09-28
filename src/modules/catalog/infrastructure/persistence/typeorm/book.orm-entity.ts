import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { LoanOrmEntity } from "@/modules/loans/infrastructure/persistence/typeorm/loan.orm-entity"
import { LibraryOrmEntity } from "@/modules/libraries/infrastructure/persistence/typeorm/library.orm-entity"

@Entity({ name: "books" })
@Index(["title"])
@Index(["author"])
@Index(["available"])
@Index(["isbn"])
@Index(["libraryId"])
export class BookOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 255 })
  title!: string

  @Column({ length: 255 })
  author!: string

  @Column({ length: 13 })
  isbn!: string

  @Column({ default: true })
  available!: boolean

  @Column({ name: "library_id", type: "int", nullable: true })
  libraryId!: number | null

  @ManyToOne(() => LibraryOrmEntity, (library) => library.books, { onDelete: "SET NULL" })
  @JoinColumn({ name: "library_id" })
  library?: LibraryOrmEntity | null

  @OneToMany(() => LoanOrmEntity, (loan) => loan.book)
  loans?: LoanOrmEntity[]

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date
}
