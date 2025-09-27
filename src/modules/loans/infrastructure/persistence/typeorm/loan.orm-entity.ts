import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type ColumnType,
} from "typeorm"
import { BookOrmEntity } from "@/modules/catalog/infrastructure/persistence/typeorm/book.orm-entity"
import { MemberOrmEntity } from "@/modules/members/infrastructure/persistence/typeorm/member.orm-entity"

const DATE_COLUMN_TYPE = (process.env.NODE_ENV === "test" ? "datetime" : "timestamptz") as ColumnType

@Entity({ name: "loans" })
@Index(["bookId"])
@Index(["memberId"])
@Index(["loanDate"])
@Index(["returnDate"])
@Index(["bookId", "returnDate"])
export class LoanOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: "book_id" })
  bookId!: number

  @Column({ name: "member_id" })
  memberId!: number

  @Column({ name: "loan_date", type: DATE_COLUMN_TYPE })
  loanDate!: Date

  @Column({ name: "return_date", type: DATE_COLUMN_TYPE, nullable: true })
  returnDate?: Date

  @ManyToOne(() => BookOrmEntity, (book) => book.loans, { onDelete: "CASCADE" })
  @JoinColumn({ name: "book_id" })
  book?: BookOrmEntity

  @ManyToOne(() => MemberOrmEntity, (member) => member.loans, { onDelete: "CASCADE" })
  @JoinColumn({ name: "member_id" })
  member?: MemberOrmEntity

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date
}
