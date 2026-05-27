/**
 * Das Modul `krankenhaus-router` besteht aus dem Router für die Verwaltung von Krankenhäusern.
 * @packageDocumentation
 */

import { Hono } from 'hono';
import { container } from '../../container.mts';
import { createPage } from './page.mts';
import { createPageable } from '../service/pageable.mts';
import { getLogger } from '../../logger/logger.mts';

const { krankenhausService } = container;

export const router = new Hono();

const logger = getLogger('krankenhaus-router', 'file');

/**
 * GET /krankenhaus/:id - Krankenhaus anhand der ID suchen
 */
router.get('/:id', async (ctx) => {
    const { req } = ctx;

    const accept = req.header('Accept')?.toLowerCase() ?? '*/*';
    if (accept !== '*/*' && !/(json|html)/u.test(accept)) {
        logger.debug('get: Accept=%s', accept);
        return ctx.body(null, 406);
    }

    const id = req.param('id');
    logger.debug('get: id=%s', id);
    const idNumber = Number.parseInt(id, 10);
    if (Number.isNaN(idNumber)) {
        return ctx.notFound();
    }

    const krankenhaus = await krankenhausService.findById({ id: idNumber });

    const ifNonMatch = req.header('If-None-Match');
    const { version } = krankenhaus;
    if (ifNonMatch === `"${version}"`) {
        logger.debug('get: Not Modified');
        return ctx.body(null, 304);
    }

    logger.debug('get: version=%d', version);
    const { header, json } = ctx;
    header('ETag', `"${version}"`);

    logger.debug('get: krankenhaus=%o', krankenhaus);
    return json(krankenhaus);
});

/**
 * GET /krankenhaus - Krankenhäuer anhand von Query-Parametern suchen
 */
router.get('/', async (ctx) => {
    const { req } = ctx;

    const accept = req.header('Accept')?.toLowerCase() ?? '*/*';
    if (accept !== '*/*' && !/(json|html)/u.test(accept)) {
        logger.debug('get: Accept=%s', accept);
        return ctx.body(null, 406);
    }

    const queryParams = req.query();
    logger.debug('get: queryParams=%o', queryParams);
    const countOnly = queryParams['count-only'];
    if (countOnly !== undefined) {
        const count = await krankenhausService.count();
        logger.debug('get: count=%d', count);
        return ctx.json({ count });
    }

    const { page, size } = queryParams;
    delete queryParams['page'];
    delete queryParams['size'];
    logger.debug(
        'get: page=%s, size=%s, queryParams=%o',
        page,
        size,
        queryParams,
    );

    const pageable = createPageable({ number: page, size });
    const krankenhausSlice = await krankenhausService.find(
        queryParams,
        pageable,
    );
    const krankenhausPage = createPage(krankenhausSlice, pageable);
    logger.debug('get: kraankenhausPage=%o', krankenhausPage);
    return ctx.json(krankenhausPage);
});
