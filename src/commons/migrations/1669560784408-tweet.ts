import { MigrationInterface, QueryRunner } from 'typeorm';

export class tweet1669560784408 implements MigrationInterface {
  name = 'tweet1669560784408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tweets\` (\`id\` varchar(36) NOT NULL, \`text\` varchar(240) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`lastUpdatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`author_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tweets\` ADD CONSTRAINT \`FK_6783f8d04acbff7ce2b2ee823f7\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tweets\` DROP FOREIGN KEY \`FK_6783f8d04acbff7ce2b2ee823f7\``,
    );
    await queryRunner.query(`DROP TABLE \`tweets\``);
  }
}
