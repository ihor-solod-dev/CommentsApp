import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import { InitialMigration } from './migrations/001_initial';
import { UserSeeder } from './seeders/001_users';
import { StressSeeder } from './seeders/002_stress';
import { UserModel } from '../modules/users/entities/user.model';
import { CommentModel } from '../modules/comments/entities/comment.model';
import { VoteModel } from '../modules/votes/entities/vote.model';
import { FileModel } from '../modules/files/entities/file.model';
import { ReportModel } from '../modules/reports/entities/report.model';
import { RefreshTokenModel } from '../modules/auth/entities/refresh-token.model';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL!;
const url = new URL(databaseUrl);

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: url.hostname,
    port: Number(url.port) || 5432,
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    logging: false,
    models: [
        UserModel,
        CommentModel,
        VoteModel,
        FileModel,
        ReportModel,
        RefreshTokenModel,
    ],
    pool: {
        max: 30,
        min: 5,
        acquire: 120_000,
        idle: 10_000,
    }
});

type Command = 'up' | 'down' | 'seed' | 'seed-undo' | 'stress-seed' | 'stress-seed-undo';

async function run() {
    const command = process.argv[2] as Command;
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();

    try {
        switch (command) {
            case 'up':
                await new InitialMigration().up(queryInterface);
                console.log('Migration applied');
                break;
            case 'down':
                await new InitialMigration().down(queryInterface);
                console.log('Migration rolled back');
                break;
            case 'seed':
                await new UserSeeder().run(queryInterface);
                console.log('Seeders applied');
                break;
            case 'seed-undo':
                await new UserSeeder().undo(queryInterface);
                console.log('Seeders rolled back');
                break;
            case 'stress-seed':
                await new StressSeeder().run(queryInterface);
                console.log('Stress seed applied');
                break;
            case 'stress-seed-undo':
                await new StressSeeder().undo(queryInterface);
                console.log('Stress seed rolled back');
                break;
            default:
                console.error('Unknown command');
                process.exit(1);
        }
    } finally {
        await sequelize.close();
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});