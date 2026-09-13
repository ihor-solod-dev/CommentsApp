import { QueryInterface, QueryTypes } from 'sequelize';
import * as bcryptjs from 'bcryptjs';
import { generateUuidV7 } from '../../shared/utils/uuid-v7.util';

export class UserSeeder {
    async run(queryInterface: QueryInterface): Promise<void> {
        const adminPassword = await bcryptjs.hash('12345678', 12);
        const userPassword = await bcryptjs.hash('12345678', 12);

        await queryInterface.sequelize.query(`
            INSERT INTO users (username, email, password, role) VALUES
            ('admin', 'admin@example.com', '${adminPassword}', 'admin'),
            ('testuser', 'user@example.com', '${userPassword}', 'user')
            ON CONFLICT DO NOTHING
        `);

        const adminResults = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE username = 'admin'`,
            { type: QueryTypes.SELECT },
        );
        const userResults = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE username = 'testuser'`,
            { type: QueryTypes.SELECT },
        );

        const admin = adminResults[0] as { id: number };
        const user = userResults[0] as { id: number };

        const commentId = generateUuidV7();
        const replyId = generateUuidV7();

        await queryInterface.sequelize.query(`
            INSERT INTO comments (id, text, depth, user_id) VALUES
            ('${commentId}', 'Welcome to Comments App! This is a seed comment.', 0, ${admin.id}),
            ('${replyId}', 'Thanks for the warm welcome!', 1, ${user.id})
            ON CONFLICT DO NOTHING
        `);

        await queryInterface.sequelize.query(`
            UPDATE comments SET parent_id = '${commentId}' WHERE id = '${replyId}'
        `);
    }

    async undo(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.sequelize.query(
            `DELETE FROM comments WHERE user_id IN (SELECT id FROM users WHERE username IN ('admin', 'testuser'))`,
        );
        await queryInterface.sequelize.query(
            `DELETE FROM users WHERE username IN ('admin', 'testuser')`,
        );
    }
}