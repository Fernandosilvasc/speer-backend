import { MigrationInterface, QueryRunner } from "typeorm";

export class removeRelationTweet1669579680548 implements MigrationInterface {
    name = 'removeRelationTweet1669579680548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tweets\` DROP FOREIGN KEY \`FK_6783f8d04acbff7ce2b2ee823f7\``);
        await queryRunner.query(`ALTER TABLE \`tweets\` DROP COLUMN \`author_id\``);
        await queryRunner.query(`ALTER TABLE \`tweets\` ADD \`author_id\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tweets\` DROP COLUMN \`author_id\``);
        await queryRunner.query(`ALTER TABLE \`tweets\` ADD \`author_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`tweets\` ADD CONSTRAINT \`FK_6783f8d04acbff7ce2b2ee823f7\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
