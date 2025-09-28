import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm"

export class AddIsbnToBooksTable1717094402000 implements MigrationInterface {
  name = "AddIsbnToBooksTable1717094402000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "books",
      new TableColumn({
        name: "isbn",
        type: "varchar",
        length: "13",
        isNullable: false,
        default: "'0000000000'",
      }),
    )

    await queryRunner.query("UPDATE books SET isbn = '0000000000' WHERE isbn IS NULL")

    await queryRunner.createIndex(
      "books",
      new TableIndex({
        name: "idx_books_isbn",
        columnNames: ["isbn"],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("books", "idx_books_isbn")
    await queryRunner.dropColumn("books", "isbn")
  }
}
