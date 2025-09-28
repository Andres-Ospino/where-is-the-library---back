import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { BookOrmEntity } from "@/modules/catalog/infrastructure/persistence/typeorm/book.orm-entity"

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

  @OneToMany(() => BookOrmEntity, (book) => book.library)
  books?: BookOrmEntity[]
}
