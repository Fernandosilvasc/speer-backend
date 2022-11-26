import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from './config/config.service';

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: configService.get('database.host'),
  port: configService.get('database.port'),
  username: configService.get('database.username'),
  password: configService.get('database.password'),
  database: configService.get('database.name'),
  entities: ['dist/commons/persistence/*.js'],
  migrationsTableName: 'migrations',
  migrations: ['dist/commons/migrations/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
