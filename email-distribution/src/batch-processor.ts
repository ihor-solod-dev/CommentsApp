import axios from 'axios';
import { publishEmailJob } from './rabbitmq';
import { config } from './config';

const apiHeaders = { 'x-internal-secret': config.mainApiSecret };

async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isFakeEmail(email: string): boolean {
    return email.toLowerCase().endsWith('@example.com');
}

export async function processAllUsers() {
    let page = 1;
    let hasMore = true;
    let processed = 0;
    let skipped = 0;

    while (hasMore) {
        const { data } = await axios.get(`${config.mainApiUrl}/internal/stats/users`, {
            headers: apiHeaders,
            params: { page, pageSize: config.batchSize },
        });

        const { users, total } = data.data;
        if (!users.length) break;

        for (const user of users) {
            if (isFakeEmail(user.email)) {
                skipped++;
                continue;
            }

            const statsResponse = await axios.get(
                `${config.mainApiUrl}/internal/stats/user/${user.id}`,
                { headers: apiHeaders },
            );
            const stats = statsResponse.data.data;

            await publishEmailJob({
                to: user.email,
                username: user.username,
                totalComments: stats.totalComments,
                totalScore: stats.totalScore,
            });
            processed++;
        }

        hasMore = page * config.batchSize < total;
        page++;
        if (hasMore) await delay(config.batchDelayMs);
    }

    console.log(`Done. Queued: ${processed}, skipped (example.com): ${skipped}`);
}