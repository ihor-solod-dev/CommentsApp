// main-api/src/database/seeders/002_stress.ts

import { QueryInterface } from 'sequelize';
import * as bcryptjs from 'bcryptjs';
import { UserModel } from '../../modules/users/entities/user.model';
import { CommentModel } from '../../modules/comments/entities/comment.model';
import { VoteModel } from '../../modules/votes/entities/vote.model';

// ─── Static data pools ───────────────────────────────────────────────────────

const FIRST_NAMES = [
    'James', 'Oliver', 'Liam', 'Noah', 'Ethan', 'Lucas', 'Mason', 'Logan',
    'Aiden', 'Jackson', 'Sebastian', 'Carter', 'Owen', 'Wyatt', 'Dylan',
    'Hunter', 'Henry', 'Eli', 'Jaxon', 'Julian', 'Grayson', 'Levi', 'Isaac',
    'Gabriel', 'Anthony', 'Connor', 'Cameron', 'Adrian', 'Nolan', 'Bentley',
    'Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte',
    'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Emily', 'Elizabeth', 'Sofia',
    'Ella', 'Madison', 'Scarlett', 'Victoria', 'Aria', 'Luna',
];

const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
    'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
    'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
    'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts',
];

const COMMENT_TEXTS = [
    `I've been using this platform for a few months now and I must say the experience has been <strong>remarkable</strong>. The interface is clean, the performance is solid, and the community is genuinely helpful. Keep up the great work!`,
`Has anyone else noticed how <code>Array.prototype.flatMap()</code> completely changed the way we write data transformations? It's one of those additions to the language that seems small at first but ends up being absolutely essential once you start using it regularly.`,
`The thing about modern web development that nobody talks about enough is how much cognitive load we place on developers. Every new tool, every new paradigm, every new best practice adds another layer of complexity. Sometimes I wonder if we've overcomplicated things beyond reason.`,
`Just finished reading a fascinating paper on distributed systems consensus algorithms. The way Raft simplifies the mental model compared to Paxos is genuinely elegant. If you're working on anything involving <strong>distributed coordination</strong>, I highly recommend diving into the original Raft paper.`,
`<strong>Hot take:</strong> most performance optimizations are premature. I've seen teams spend weeks shaving milliseconds off operations that run once per day while ignoring N+1 queries that hammer the database hundreds of times per request. Profile first, optimize second.`,
`The debate between <code>tabs</code> vs <code>spaces</code> is tired, but the one about <strong>semicolons in JavaScript</strong> still somehow gets people heated. At this point just pick a style guide and stick with it — consistency matters far more than which option you choose.`,
`Interesting discussion happening in the comments below about microservices vs monoliths. My take after working on both extensively: the problem isn't the architecture pattern, it's the organizational structure. Conway's Law is real and it will bite you regardless of what you choose.`,
`<i>A thought experiment:</i> if you had to rebuild your entire tech stack from scratch today with no legacy constraints, what would you actually choose? I find myself leaning toward boring, well-understood technologies over exciting cutting-edge ones. Stability over novelty.`,
`Something that doesn't get enough attention in code reviews is <strong>naming</strong>. A well-named variable or function communicates intent so clearly that comments become redundant. I'd rather review code with slightly longer names that are self-documenting than terse abbreviations that require context.`,
`The <code>Promise.allSettled()</code> method is criminally underused. When you need to run multiple async operations and handle each result independently regardless of failures, it's the perfect tool. Stop wrapping everything in try-catch when the platform gives you better primitives.`,
`Been lurking here for a while but finally decided to comment. This thread raises some really important points about scalability that I think are often glossed over in introductory materials. Real production systems are messy and the solutions are rarely as clean as the tutorials suggest.`,
`The documentation for this feature is honestly lacking. I spent three hours figuring out something that should have been a five-minute read. Better docs would dramatically lower the barrier to entry and reduce the number of repetitive questions in forums like this one.`,
`Performance benchmarks without context are nearly meaningless. You need to know the hardware, the OS, the workload characteristics, the measurement methodology, and a dozen other variables before a number means anything. I always ask for the full setup when someone posts benchmark results.`,
`There's a generational shift happening in how we think about software reliability. The old model was to build things that don't break. The new model is to build things that fail gracefully and recover automatically. Both philosophies have merit depending on the system.`,
`Open source sustainability is one of the most underappreciated problems in tech. We build enormous industries on top of libraries maintained by one or two volunteers in their spare time, then express surprise when those maintainers burn out or make mistakes under pressure.`,
`Cela fait six mois que j'utilise cette plateforme et l'expérience a été vraiment <strong>formidable</strong>. La communauté est accueillante et la qualité des discussions techniques est très élevée. J'ai particulièrement appris beaucoup de la discussion de la semaine dernière sur les patterns de traitement asynchrone. Merci et à bientôt !`,
`Depuis que nous avons adopté <code>TypeScript</code> de manière sérieuse, la productivité de toute l'équipe a <strong>considérablement augmenté</strong>. La détection précoce des bugs grâce à la sûreté des types, mais aussi le support IDE nettement amélioré, rendent le développement bien plus agréable. Si vous hésitez à cause du coût de migration, je recommande de commencer par un petit projet.`,
`J'ai une question sur la conception de bases de données. Notre système est actuellement très normalisé, mais des problèmes de performance en lecture commencent à apparaître. Nous envisageons la dénormalisation ou l'utilisation de vues matérialisées. <i>Quelle approche utilisez-vous de votre côté ?</i> Vos retours d'expérience seraient très utiles.`,
`Cela fait un an que nous avons adopté l'architecture microservices. Les <strong>avantages</strong> : déploiements indépendants et frontières de responsabilité claires. Les <strong>inconvénients</strong> : complexité des systèmes distribués et coûts opérationnels plus élevés. Pour les petites équipes, je trouve honnêtement qu'un monolithe convient souvent mieux. Il est crucial de bien comprendre les compromis avant de choisir.`,
`Je vais parler d'un projet où nous sommes passés de <code>React</code> à <code>Vue</code>. La principale raison était le background de l'équipe et la courbe d'apprentissage. Conclusion : les deux frameworks sont excellents, mais le niveau de maîtrise de l'équipe et la nature du code existant influencent fortement le choix. J'ai redécouvert qu'il vaut mieux privilégier le pragmatisme aux débats de frameworks.`,
`J'ai commencé à prendre la sécurité au sérieux après avoir vécu mon premier incident en production. Au-delà des protections de base contre <i>XSS, SQL injection et CSRF</i>, j'ai appris qu'il faut aussi faire attention à la gestion des dépendances et au traitement des secrets — des points souvent négligés. La sécurité n'est pas une fonctionnalité, elle doit être intégrée dès la conception.`,
`D'après mon expérience en optimisation de performances, mesurer avant tout est absolument essentiel. <strong>Optimiser au feeling est souvent une perte de temps</strong> : on se retrouve fréquemment à améliorer quelque chose qui n'est pas du tout le vrai goulot d'étranglement. Utilisez des outils de profiling pour identifier précisément les problèmes avant d'intervenir.`,
`Discussion intéressante lors de la réunion d'aujourd'hui : faut-il écrire les tests avant ou après le code ? Je comprends la théorie du TDD, mais dans les projets réels les exigences évoluent souvent, ce qui rend difficile d'écrire des tests parfaits dès le départ. Peut-être que la meilleure approche dépend de l'équipe.`,
`Aux jeunes ingénieurs qui s'interrogent sur leur carrière : développer ses compétences techniques est important, mais les capacités de communication et le processus de réflexion pour résoudre les problèmes le sont tout autant, voire plus. Un bon ingénieur n'est pas seulement quelqu'un qui écrit du bon code, c'est quelqu'un qui collabore avec l'équipe pour résoudre des problèmes.`,
`Depuis que j'ai commencé à contribuer à l'open source, la qualité de mon code s'est nettement améliorée. L'habitude d'écrire du code lisible par d'autres, les retours lors des revues, l'exposition à différents codebases… tout cela accélère la progression. Je recommande de commencer par de petites corrections de bugs ou des améliorations de documentation.`,
`Недавно перешли с <code>MongoDB</code> на <strong>PostgreSQL</strong> и не могу нарадоваться этому решению. Транзакционность, строгая типизация данных, мощные возможности индексирования — всё это даёт уверенность в целостности данных, которой нам так не хватало. Конечно, миграция потребовала усилий, но результат стоил того.`,
`<strong>Важное наблюдение</strong> о техническом долге: он накапливается не потому что разработчики плохо работают, а потому что бизнес требует скорости доставки фич. Проблема в том, что технический долг в какой-то момент начинает тормозить ту самую скорость, ради которой его накапливали. Нужно найти баланс и регулярно выделять время на рефакторинг.`,
`Изучаю <code>Rust</code> уже несколько месяцев и хочу поделиться впечатлениями. Концепция владения памятью поначалу кажется сложной, но потом понимаешь, что компилятор просто формализует то, о чём опытные разработчики думают неосознанно. <i>Когда программа компилируется в Rust, у тебя действительно большая уверенность в её корректности.</i>`,
`Вопрос к опытным архитекторам: как вы принимаете решение о границах микросервисов? Мы сейчас разбиваем монолит и столкнулись с тем, что некоторые сервисы получаются слишком мелкими и порождают лишние сетевые вызовы, а другие — слишком крупными и фактически остаются мини-монолитами. <strong>Bounded Context из DDD</strong> кажется правильным подходом, но на практике его применение вызывает вопросы.`,
`<i>Размышляю о будущем профессии.</i> Инструменты на основе ИИ становятся всё мощнее и уже сейчас способны генерировать рабочий код для типичных задач. Но понимание архитектуры, умение формулировать задачу, отладка сложных систем и принятие компромиссных решений — это то, что пока остаётся за человеком. Возможно, через десять лет наша роль изменится, но вряд ли исчезнет.`,
`Работаю над оптимизацией <code>SQL</code> запросов в высоконагруженной системе. Самое большое открытие — насколько критично <strong>правильное использование индексов</strong>. Запрос, который выполнялся 30 секунд, после добавления составного индекса начал работать за 50 миллисекунд. Всегда изучайте план выполнения запроса через <code>EXPLAIN ANALYZE</code> перед тем как что-то оптимизировать.`,
`Хочу поговорить о культуре код-ревью. В нашей команде долгое время ревью воспринималось как поиск ошибок и повод для критики. После того как мы переосмыслили процесс и начали относиться к нему как к <strong>совместному обучению</strong>, атмосфера изменилась кардинально. Теперь люди не боятся открывать пул-реквесты и охотно делятся экспериментальными решениями.`,
`Только что прочитал интересную статью о том, как Netflix справляется с миллионами одновременных соединений. Их подход к отказоустойчивости через принцип «проектирования с учётом сбоев» действительно впечатляет. Chaos Engineering как практика — это то, что многие компании должны взять на вооружение раньше, чем они узнают о своих слабых местах через реальные аварии.`,
`Вот честное мнение о современных фреймворках для фронтенда: мы создаём решения невероятной сложности для проблем, которые зачастую не так уж и сложны. Прежде чем тянуть тяжёлый фреймворк, задайте себе вопрос: действительно ли задача требует такого уровня инструментария? Иногда ванильный JavaScript и несколько хорошо написанных модулей — это всё что нужно.`,
`Полгода назад я перешёл из крупной корпорации в небольшой стартап и разница ощущается во всём. Скорость принятия решений, близость к продукту, возможность видеть прямое влияние своей работы — всё это невероятно мотивирует. Хотя стабильность и ресурсы большой компании тоже имеют свою ценность. Выбор зависит от того, что для вас важнее на конкретном этапе карьеры.`,
`Занимаюсь наставничеством джунов уже второй год и это даёт мне столько же, сколько я даю им. Объяснение концепций вслух выявляет пробелы в собственном понимании. Свежий взгляд новичка порой задаёт вопросы, которые заставляют меня пересмотреть устоявшиеся убеждения. Если у вас есть возможность менторить кого-то — обязательно попробуйте.`,
`Провели ретроспективу спринта и выяснили кое-что интересное: большинство задержек происходит не из-за технических сложностей, а из-за нечётких требований и частых смен приоритетов. Это наводит на мысль, что инвестиции в качество постановки задач и коммуникацию между командами окупятся лучше, чем любые технические оптимизации.`,
];

// ─── UUID v7 bulk generator ───────────────────────────────────────────────────
//
// UUID v7 layout (128 bits):
//   [0–47]   unix_ts_ms  — 48-bit millisecond timestamp
//   [48–51]  0b0111      — version 7
//   [52–63]  rand_a      — 12 random bits
//   [64–65]  0b10        — variant bits
//   [66–127] rand_b      — 62 random bits
//
// Generating N UUIDs in one getRandomValues call costs one syscall instead of N.

function generateUuidV7Bulk(count: number): string[] {
    const RAND_BYTES_PER_UUID = 10;
    const MAX_BYTES = 65_536;
    const MAX_UUIDS_PER_CALL = Math.floor(MAX_BYTES / RAND_BYTES_PER_UUID); // 6553

    const results: string[] = new Array(count);
    const hex = new Array(256);
    for (let i = 0; i < 256; i++) hex[i] = i.toString(16).padStart(2, '0');

    let now = Date.now();
    let seq = 0;
    let resultIdx = 0;

    while (resultIdx < count) {
        const chunkSize = Math.min(MAX_UUIDS_PER_CALL, count - resultIdx);
        const buf = new Uint8Array(chunkSize * RAND_BYTES_PER_UUID);
        crypto.getRandomValues(buf);

        for (let i = 0; i < chunkSize; i++) {
            const ts = now;
            seq = (seq + 1) & 0xfff;
            const tick = Date.now();
            if (tick !== now) {
                now = tick;
                seq = 0;
            }

            const base = i * RAND_BYTES_PER_UUID;
            const r0 = buf[base];
            const r1 = buf[base + 1];
            const r2 = buf[base + 2];
            const r3 = buf[base + 3];
            const r4 = buf[base + 4];
            const r5 = buf[base + 5];
            const r6 = buf[base + 6];
            const r7 = buf[base + 7];
            const r8 = buf[base + 8];
            const r9 = buf[base + 9];

            const ts0 = (ts / 0x100000000) >>> 0;
            const ts1 = ts >>> 0;

            const ver = 0x70 | ((seq >> 8) & 0x0f);
            const ra = seq & 0xff;
            const var_ = 0x80 | (r4 & 0x3f);

            results[resultIdx++] =
                hex[(ts0 >> 8) & 0xff] +
                hex[ts0 & 0xff] +
                hex[(ts1 >> 24) & 0xff] +
                hex[(ts1 >> 16) & 0xff] +
                '-' +
                hex[(ts1 >> 8) & 0xff] +
                hex[ts1 & 0xff] +
                '-' +
                hex[ver] +
                hex[ra] +
                '-' +
                hex[var_] +
                hex[r5] +
                '-' +
                hex[r6] + hex[r7] + hex[r8] + hex[r9] + hex[r0] + hex[r1];
        }
    }

    return results;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const randInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function processBatches<T>(
    total: number,
    batchSize: number,
    concurrency: number,
    buildBatch: (offset: number, size: number) => T[],
    insertBatch: (rows: T[]) => Promise<void>,
): Promise<void> {
    const batches: Array<{ offset: number; size: number }> = [];
    for (let offset = 0; offset < total; offset += batchSize) {
        batches.push({ offset, size: Math.min(batchSize, total - offset) });
    }

    let idx = 0;
    const workers = Array.from({ length: concurrency }, async () => {
        while (true) {
            const current = idx++;
            if (current >= batches.length) break;
            const { offset, size } = batches[current];
            await insertBatch(buildBatch(offset, size));
        }
    });
    await Promise.all(workers);
}

function sampleArray<T>(arr: T[], k: number): T[] {
    const copy = arr.slice();
    const end = Math.min(k, copy.length);
    for (let i = 0; i < end; i++) {
        const j = i + Math.floor(Math.random() * (copy.length - i));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, end);
}

// ─── Seeder ──────────────────────────────────────────────────────────────────

export class StressSeeder {
    async run(queryInterface: QueryInterface): Promise<void> {
        const TOTAL_USERS = 100_000;
        const USER_BATCH = 5_000;
        const USER_CONCURRENCY = 4;

        const DEPTH_COUNTS = [500_000, 500_000, 80_000, 20_000, 2_000];
        const COMMENT_BATCH = 5_000;
        const COMMENT_CONCURRENCY = 4;

        const VOTE_BATCH = 10_000;
        const VOTE_CONCURRENCY = 4;
        const VOTES_MIN = 5;
        const VOTES_MAX = 15;
        const COMMENT_SAMPLE = 50_000;
        const SCORE_BATCH = 20_000;

        // ── 1. Hash password once ────────────────────────────────────────────
        console.time('password-hash');
        const hashedPassword = await bcryptjs.hash('12345678', 12);
        console.timeEnd('password-hash');

        // ── 2. Seed users ────────────────────────────────────────────────────
        console.time('users');
        await processBatches(
            TOTAL_USERS,
            USER_BATCH,
            USER_CONCURRENCY,
            (offset, size) =>
                Array.from({ length: size }, (_, i) => {
                    const n = offset + i + 1;
                    const first = pick(FIRST_NAMES);
                    const last = pick(LAST_NAMES);
                    const username = `${first}${last}${n}`;
                    return {
                        username,
                        email: `${username.toLowerCase()}@example.com`,
                        password: hashedPassword,
                        role: 'user' as const,
                    };
                }),
            (rows) =>
                UserModel.bulkCreate(rows, {
                    ignoreDuplicates: true,
                    hooks: false,
                    validate: false,
                }) as Promise<any>,
        );
        console.timeEnd('users');

        // ── 3. Load user IDs ─────────────────────────────────────────────────
        console.time('load-user-ids');
        const userRecords = await UserModel.findAll({
            attributes: ['id'],
            where: { role: 'user' },
            raw: true,
        });
        const userIds = userRecords.map((u) => (u as any).id as number);
        console.timeEnd('load-user-ids');

        // ── 4. Seed comments by depth ────────────────────────────────────────
        const depthUuids: string[][] = [];

        for (let depth = 0; depth < DEPTH_COUNTS.length; depth++) {
            const count = DEPTH_COUNTS[depth];
            const parentPool = depth > 0 ? depthUuids[depth - 1] : null;

            console.time(`comments-depth-${depth}`);

            const uuids: string[] = new Array(count);
            let uuidOffset = 0;

            await processBatches(
                count,
                COMMENT_BATCH,
                COMMENT_CONCURRENCY,
                (offset, size) => {
                    const batchUuids = generateUuidV7Bulk(size);
                    for (let i = 0; i < size; i++) {
                        uuids[offset + i] = batchUuids[i];
                    }

                    return batchUuids.map((id, i) => ({
                        id,
                        text: pick(COMMENT_TEXTS),
                        score: 0,
                        depth,
                        isDeleted: false,
                        parentId: parentPool
                            ? parentPool[randInt(0, parentPool.length - 1)]
                            : null,
                        userId: pick(userIds),
                    }));
                },
                (rows) =>
                    CommentModel.bulkCreate(rows, {
                        ignoreDuplicates: true,
                        hooks: false,
                        validate: false,
                        returning: false,
                    }) as Promise<any>,
            );

            depthUuids.push(uuids);
            console.timeEnd(`comments-depth-${depth}`);
        }

        // ── 5. Build flat comment pool ───────────────────────────────────────
        console.time('flatten-comment-pool');
        let totalComments = 0;
        for (const arr of depthUuids) totalComments += arr.length;

        const allCommentUuids: string[] = new Array(totalComments);
        let writeIdx = 0;
        for (const arr of depthUuids) {
            for (const uuid of arr) allCommentUuids[writeIdx++] = uuid;
        }
        console.timeEnd('flatten-comment-pool');

        // ── 6. Seed votes + accumulate score deltas ──────────────────────────
        console.time('votes');

        const scoreDeltas = new Map<string, number>();
        const allVoteRows: Array<{
            dateTime: Date;
            voteType: 'like' | 'dislike';
            userId: number;
            commentId: string;
        }> = [];

        const commentSample = sampleArray(
            allCommentUuids,
            Math.min(totalComments, COMMENT_SAMPLE),
        );
        const sampleLen = commentSample.length;

        for (const userId of userIds) {
            const voteCount = randInt(VOTES_MIN, VOTES_MAX);
            const chosen = sampleArray(commentSample, Math.min(voteCount, sampleLen));

            for (const commentId of chosen) {
                const voteType = Math.random() < 0.7 ? 'like' : 'dislike';
                allVoteRows.push({ dateTime: new Date(), voteType, userId, commentId });
                scoreDeltas.set(
                    commentId,
                    (scoreDeltas.get(commentId) ?? 0) + (voteType === 'like' ? 1 : -1),
                );
            }
        }

        await processBatches(
            allVoteRows.length,
            VOTE_BATCH,
            VOTE_CONCURRENCY,
            (offset, size) => allVoteRows.slice(offset, offset + size),
            (rows) =>
                VoteModel.bulkCreate(rows, {
                    ignoreDuplicates: true,
                    hooks: false,
                    validate: false,
                    returning: false,
                }) as Promise<any>,
        );
        console.timeEnd('votes');

        // ── 7. Apply score deltas via unnest ─────────────────────────────────
        console.time('score-update');
        const deltaEntries = [...scoreDeltas.entries()];

        for (let i = 0; i < deltaEntries.length; i += SCORE_BATCH) {
            const chunk = deltaEntries.slice(i, i + SCORE_BATCH);
            const ids = chunk.map(([id]) => id);
            const deltas = chunk.map(([, d]) => d);

            await queryInterface.sequelize.query(
                `UPDATE comments
                    SET score = score + delta_tbl.delta
                   FROM (
                       SELECT unnest(ARRAY[:ids]::uuid[]) AS id,
                              unnest(ARRAY[:deltas]::int[]) AS delta
                   ) AS delta_tbl
                  WHERE comments.id = delta_tbl.id`,
                { replacements: { ids, deltas } },
            );
        }
        console.timeEnd('score-update');

        console.log('Stress seed complete.');
    }

    async undo(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.sequelize.query(
            `DELETE FROM votes   WHERE user_id  IN (SELECT id FROM users WHERE role = 'user' AND username ~ '^[A-Za-z]+[0-9]+$')`,
        );
        await queryInterface.sequelize.query(
            `DELETE FROM comments WHERE user_id IN (SELECT id FROM users WHERE role = 'user' AND username ~ '^[A-Za-z]+[0-9]+$')`,
        );
        await queryInterface.sequelize.query(
            `DELETE FROM users WHERE role = 'user' AND username ~ '^[A-Za-z]+[0-9]+$'`,
        );
    }
}