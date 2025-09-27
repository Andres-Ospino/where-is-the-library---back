import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity({ name: "auth_accounts" })
@Index(["email"], { unique: true })
export class AuthAccountOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 255, unique: true })
  email!: string

  @Column({ name: "password_hash", length: 255 })
  passwordHash!: string

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date
}
