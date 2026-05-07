import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../../config/env';
import { Event } from './entities/event.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { User } from './entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.databaseUrl,
  synchronize: true,
  logging: true,
  migrationsRun: true,
  entities: [User, Event, EventParticipant],
  migrations: ['src/db/migrations/**/*.ts'],
  subscribers: []
});