import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Note } from './entity/note';

export const NOTES_DB_NAME = 'note_taker_server';

const DATA_SOURCE_OPTIONS: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: NOTES_DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Note],
  migrations: [],
  subscribers: [],
};

export const APP_DATA_SOURCE = new DataSource(DATA_SOURCE_OPTIONS);

export const CREATE_DB_DATA_SOURCE = new DataSource({
  ...DATA_SOURCE_OPTIONS,
  // Use the default DB just to establish a successful connection to the Postgres instance.
  database: 'postgres',
  entities: [],
});

export async function setUpDb() {
  await APP_DATA_SOURCE.initialize()
    .then(() => console.log('Opened DB connection.'))
    .catch(async (error) => {
      if (error.code === '3D000') {
        // Create the DB if it doesn't exist.
        await CREATE_DB_DATA_SOURCE.initialize()
          .then(async () => {
            console.log(`Creating ${NOTES_DB_NAME} database.`);
            await CREATE_DB_DATA_SOURCE.query(`CREATE DATABASE ${NOTES_DB_NAME}`);
            await CREATE_DB_DATA_SOURCE.destroy();
            await APP_DATA_SOURCE.initialize().then(() => console.log('Opened DB connection.'));
          })
          .catch((error) => {
            console.log(error);
            throw error;
          });
      } else {
        console.log(error);
        throw error;
      }
    });
}

export async function closeDb() {
  await APP_DATA_SOURCE.destroy();
}
