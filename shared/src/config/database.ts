import { DataSource } from "typeorm";

export const createAppDataSource = (entities: Function[] = []): DataSource => {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.NODE_ENV !== 'production',
    entities,
  });
};
