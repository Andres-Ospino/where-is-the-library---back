import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm"

export class CreateMembersBooksLoansTables1717094401000 implements MigrationInterface {
  name = "CreateMembersBooksLoansTables1717094401000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "members",
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
            name: "email",
            type: "varchar",
            length: "255",
            isNullable: false,
            isUnique: true,
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
      "members",
      new TableIndex({
        name: "idx_members_email",
        columnNames: ["email"],
        isUnique: true,
      }),
    )

    await queryRunner.createTable(
      new Table({
        name: "books",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "author",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "available",
            type: "boolean",
            isNullable: false,
            default: "true",
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

    await queryRunner.createIndices(
      "books",
      [
        new TableIndex({
          name: "idx_books_title",
          columnNames: ["title"],
        }),
        new TableIndex({
          name: "idx_books_author",
          columnNames: ["author"],
        }),
        new TableIndex({
          name: "idx_books_available",
          columnNames: ["available"],
        }),
      ],
    )

    const dateColumnType = queryRunner.connection.options.type === "sqlite" ? "datetime" : "timestamptz"

    await queryRunner.createTable(
      new Table({
        name: "loans",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "book_id",
            type: "integer",
            isNullable: false,
          },
          {
            name: "member_id",
            type: "integer",
            isNullable: false,
          },
          {
            name: "loan_date",
            type: dateColumnType,
            isNullable: false,
          },
          {
            name: "return_date",
            type: dateColumnType,
            isNullable: true,
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

    await queryRunner.createIndices(
      "loans",
      [
        new TableIndex({ name: "idx_loans_book_id", columnNames: ["book_id"] }),
        new TableIndex({ name: "idx_loans_member_id", columnNames: ["member_id"] }),
        new TableIndex({ name: "idx_loans_loan_date", columnNames: ["loan_date"] }),
        new TableIndex({ name: "idx_loans_return_date", columnNames: ["return_date"] }),
        new TableIndex({ name: "idx_loans_book_id_return_date", columnNames: ["book_id", "return_date"] }),
      ],
    )

    await queryRunner.createForeignKeys("loans", [
      new TableForeignKey({
        name: "fk_loans_book_id",
        columnNames: ["book_id"],
        referencedTableName: "books",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
      new TableForeignKey({
        name: "fk_loans_member_id",
        columnNames: ["member_id"],
        referencedTableName: "members",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("loans", "fk_loans_book_id")
    await queryRunner.dropForeignKey("loans", "fk_loans_member_id")

    await queryRunner.dropIndex("loans", "idx_loans_book_id")
    await queryRunner.dropIndex("loans", "idx_loans_member_id")
    await queryRunner.dropIndex("loans", "idx_loans_loan_date")
    await queryRunner.dropIndex("loans", "idx_loans_return_date")
    await queryRunner.dropIndex("loans", "idx_loans_book_id_return_date")

    await queryRunner.dropTable("loans")

    await queryRunner.dropIndex("books", "idx_books_title")
    await queryRunner.dropIndex("books", "idx_books_author")
    await queryRunner.dropIndex("books", "idx_books_available")

    await queryRunner.dropTable("books")

    await queryRunner.dropIndex("members", "idx_members_email")

    await queryRunner.dropTable("members")
  }
}
