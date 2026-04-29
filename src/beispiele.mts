import process from 'node:process';
import { styleText } from 'node:util';
import { PrismaPg } from '@prisma/adapter-pg';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import {
    PrismaClient,
    type Krankenhaus,
    type Prisma,
} from '../generated/prisma/client.ts';

let message = styleText(['black', 'bgWhite'], 'Node version');
console.log(`${message}=${process.version}`);
message = styleText(['black', 'bgWhite'], 'DATABASE_URL');
console.log(`${message}=${process.env['DATABASE_URL']}`);
console.log();

const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL'],
});

const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = [
    {
        emit: 'event',
        level: 'query',
    },
    'info',
    'warn',
    'error',
];

const prisma = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log,
    comments: [prismaQueryInsights()],
});
prisma.$on('query', (e: Prisma.QueryEvent) => {
    message = styleText('green', `Query: ${e.query}`);
    console.log(message);
    message = styleText('cyan', `Duration: ${e.duration} ms`);
    console.log(message);
});

export type KrankenhausMitAdresseUndFachbereiche = Prisma.KrankenhausGetPayload<{
    include: {
        adresse: true;
        fachbereiche: true;
    };
}>;

try {
    await prisma.$connect();

    const krankenhaus: Krankenhaus | null = await prisma.krankenhaus.findUnique({
        where: { id: 10 },
    });
    message = styleText(['black', 'bgWhite'], 'krankenhaus');
    console.log(`${message} = %j`, krankenhaus);
    console.log();

    const krankenhaeuser: KrankenhausMitAdresseUndFachbereiche[] = await prisma.krankenhaus.findMany({
        where: {
            adresse: {
                ort: {
                    contains: 'o',
                },
            },
        },
        include: {
            adresse: true,
            fachbereiche: true,
        },
    });
    message = styleText(['black', 'bgWhite'], 'krankenhaeuserMitAdr');
    console.log(`${message} = %j`, krankenhaeuser);
    console.log();

    const adresse = krankenhaeuser.map((b) => b.adresse);
    message = styleText(['black', 'bgWhite'], 'adresse');
    console.log(`${message} = %j`, adresse);
    console.log();

    const krankenhaeuserPage2: Krankenhaus[] = await prisma.krankenhaus.findMany({
        skip: 5,
        take: 5,
    });
    message = styleText(['black', 'bgWhite'], 'krankenhaeuserPage2');
    console.log(`${message} = %j`, krankenhaeuserPage2);
    console.log();
} finally {
    await prisma.$disconnect();
}

const adapterAdmin = new PrismaPg({
    connectionString: process.env['DATABASE_URL_ADMIN'],
});
const prismaAdmin = new PrismaClient({ adapter: adapterAdmin });
try {
    const krankenhaeuserAdmin: Krankenhaus[] = await prismaAdmin.krankenhaus.findMany({
        where: {
            adresse: {
                strasse: {
                    contains: 'e',
                },
            },
        },
    });
    message = styleText(['black', 'bgWhite'], 'krankenhaeuserAdmin');
    console.log(`${message} = ${JSON.stringify(krankenhaeuserAdmin)}`);
} finally {
    await prismaAdmin.$disconnect();
}
