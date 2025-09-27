import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"

export class CreateAuthAccountsTable1717094400000 implements MigrationInterface {
  name = "CreateAuthAccountsTable1717094400000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "auth_accounts",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "password_hash",
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
      "auth_accounts",
      new TableIndex({
        name: "idx_auth_accounts_email",
        columnNames: ["email"],
        isUnique: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("auth_accounts", "idx_auth_accounts_email")
    await queryRunner.dropTable("auth_accounts")
  }
}
