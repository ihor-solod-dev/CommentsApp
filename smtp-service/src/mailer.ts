import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.password },
});

const template = fs.readFileSync(
    path.join(__dirname, 'templates/daily-stats.html'),
    'utf-8',
);

export async function sendDailyStats(job: {
    to: string;
    username: string;
    totalComments: number;
    totalScore: number;
}) {
    const html = template
        .replace('{{username}}', job.username)
        .replace('{{totalComments}}', String(job.totalComments))
        .replace('{{totalScore}}', String(job.totalScore))
        .replace('{{date}}', new Date().toLocaleDateString('uk-UA'));

    await transporter.sendMail({
        from: `"${config.smtp.fromName}" <${config.smtp.from}>`,
        to: job.to,
        subject: 'Ваша щоденна статистика коментарів',
        html,
    });
}