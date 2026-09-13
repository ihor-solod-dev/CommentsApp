import { QueryInterface, QueryTypes } from 'sequelize';

export class InitialMigration {
    async up(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

        await queryInterface.sequelize.query(`
            CREATE TYPE user_role AS ENUM ('user', 'admin')
        `);

        await queryInterface.sequelize.query(`
            CREATE TYPE vote_type AS ENUM ('like', 'dislike')
        `);

        await queryInterface.sequelize.query(`
            CREATE TABLE users (
                id          SERIAL PRIMARY KEY,
                username    VARCHAR(50)  NOT NULL UNIQUE,
                email       VARCHAR(255) NOT NULL UNIQUE,
                password    VARCHAR(255) NOT NULL,
                role        user_role    NOT NULL DEFAULT 'user',
                avatar      VARCHAR(512),
                created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await queryInterface.sequelize.query(`
            CREATE TABLE refresh_tokens (
                id          SERIAL PRIMARY KEY,
                jti         VARCHAR(255) NOT NULL UNIQUE,
                user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires_at  TIMESTAMP NOT NULL,
                created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await queryInterface.sequelize.query(`
            CREATE TABLE comments (
                id          UUID         PRIMARY KEY,
                date_time   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                text        TEXT         NOT NULL,
                score       INTEGER      NOT NULL DEFAULT 0,
                depth       SMALLINT     NOT NULL DEFAULT 0,
                is_deleted  BOOLEAN      NOT NULL DEFAULT FALSE,
                created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                parent_id   UUID         REFERENCES comments(id) ON DELETE SET NULL,
                user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await queryInterface.sequelize.query(`
            CREATE TABLE files (
                id          UUID PRIMARY KEY,
                file_path   TEXT NOT NULL,
                comment_id  UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE
            )
        `);

        await queryInterface.sequelize.query(`
            CREATE TABLE votes (
                id          SERIAL PRIMARY KEY,
                date_time   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                vote_type   vote_type    NOT NULL,
                user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                comment_id  UUID         NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
                UNIQUE (user_id, comment_id)
            )
        `);

        await queryInterface.sequelize.query(`
            CREATE TABLE reports (
                id          SERIAL PRIMARY KEY,
                text        TEXT         NOT NULL,
                created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                comment_id  UUID         NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
                user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE (user_id, comment_id)
            )
        `);

        await queryInterface.sequelize.query(`CREATE INDEX idx_comments_user_id ON comments(user_id)`);
        await queryInterface.sequelize.query(`CREATE INDEX idx_comments_parent_id ON comments(parent_id)`);
        await queryInterface.sequelize.query(`CREATE INDEX idx_comments_depth ON comments(depth)`);
        await queryInterface.sequelize.query(`CREATE INDEX idx_comments_score ON comments(score DESC)`);
        await queryInterface.sequelize.query(`CREATE INDEX idx_files_comment_id ON files(comment_id)`);
        await queryInterface.sequelize.query(`CREATE INDEX idx_votes_comment_id ON votes(comment_id)`);
        await queryInterface.sequelize.query(`CREATE INDEX idx_votes_user_id ON votes(user_id)`);
        await queryInterface.sequelize.query(`CREATE INDEX idx_reports_comment_id ON reports(comment_id)`);
        await queryInterface.sequelize.query(`CREATE INDEX idx_reports_user_id ON reports(user_id)`);
        await queryInterface.sequelize.query(`CREATE INDEX idx_refresh_tokens_jti ON refresh_tokens(jti)`);
        await queryInterface.sequelize.query(`CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id)`);
    }

    async down(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.sequelize.query(`DROP TABLE IF EXISTS reports`);
        await queryInterface.sequelize.query(`DROP TABLE IF EXISTS votes`);
        await queryInterface.sequelize.query(`DROP TABLE IF EXISTS files`);
        await queryInterface.sequelize.query(`DROP TABLE IF EXISTS comments`);
        await queryInterface.sequelize.query(`DROP TABLE IF EXISTS refresh_tokens`);
        await queryInterface.sequelize.query(`DROP TABLE IF EXISTS users`);
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS vote_type`);
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS user_role`);
    }
}