import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity({ name: "libraries" })
@Index(["name"])
export class LibraryOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 255 })
  name!: string

  @Column({ length: 255 })
  address!: string

  @Column({ name: "opening_hours", length: 255 })
  openingHours!: string

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date
}
