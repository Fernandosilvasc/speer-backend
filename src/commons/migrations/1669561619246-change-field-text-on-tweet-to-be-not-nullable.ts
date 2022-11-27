import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeFieldTextOnTweetToBeNotNullable1669561619246
  implements MigrationInterface
{
  name = 'changeFieldTextOnTweetToBeNotNullable1669561619246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tweets\` CHANGE \`text\` \`text\` varchar(240) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tweets\` CHANGE \`text\` \`text\` varchar(240) NULL`,
    );
  }
}
