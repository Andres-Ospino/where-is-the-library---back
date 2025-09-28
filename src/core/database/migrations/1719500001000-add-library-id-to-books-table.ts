import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm"

export class AddLibraryIdToBooksTable1719500001000 implements MigrationInterface {
  name = "AddLibraryIdToBooksTable1719500001000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "books",
      new TableColumn({
        name: "library_id",
        type: "integer",
        isNullable: true,
      }),
    )

    await queryRunner.createIndex(
      "books",
      new TableIndex({
        name: "idx_books_library_id",
        columnNames: ["library_id"],
      }),
    )

    await queryRunner.createForeignKey(
      "books",
      new TableForeignKey({
        name: "fk_books_library_id",
        columnNames: ["library_id"],
        referencedTableName: "libraries",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("books", "fk_books_library_id")
    await queryRunner.dropIndex("books", "idx_books_library_id")
    await queryRunner.dropColumn("books", "library_id")
  }
}
