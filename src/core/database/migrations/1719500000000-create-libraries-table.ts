import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"

export class CreateLibrariesTable1719500000000 implements MigrationInterface {
  name = "CreateLibrariesTable1719500000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "libraries",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "address",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "opening_hours",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
        ],
      }),
      true,
    )

    await queryRunner.createIndex(
      "libraries",
      new TableIndex({
        name: "idx_libraries_name",
        columnNames: ["name"],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("libraries", "idx_libraries_name")
    await queryRunner.dropTable("libraries")
  }
}
