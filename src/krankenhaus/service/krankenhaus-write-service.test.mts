import {
    type KrankenhausCreate,
    KrankenhausWriteService,
} from './krankenhaus-write-service.mts';
import { Prisma, PrismaClient } from '../../../generated/prisma/client.ts';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { KrankenhausService } from './krankenhaus-service.mts';
