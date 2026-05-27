/**
 * Das Modul `krankenhaus-router` besteht aus dem Router für die Verwaltung von Krankenhäusern.
 * @packageDocumentation
 */

import { Hono } from 'hono';
import { container } from '../../container.mts'
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
