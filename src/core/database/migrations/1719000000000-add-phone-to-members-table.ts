import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddPhoneToMembersTable1719000000000 implements MigrationInterface {
  name = "AddPhoneToMembersTable1719000000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "members",
      new TableColumn({
        name: "phone",
        type: "varchar",
        length: "20",
        isNullable: false,
        default: "'0000000000'",
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("members", "phone")
  }
}
