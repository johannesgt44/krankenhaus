import {
    type KrankenhausCreate,
    type KrankenhausUpdate,
} from '../service/krankenhaus-write-service.mts';
import {
    KrankenhausNeuSchema,
    type KrankenhausNeuType,
    KrankenhausUpdateSchema,
    type KrankenhausUpdateType,
} from './krankenhaus-validation.mts';
import {
    createProblemDetails,
    preconditionRequired,
} from '../../problem-details.mts';
import { Hono } from 'hono';
import { container } from '../../container.mts';
import { createBaseUrl } from './create-base-url.mts';
import { getLogger } from '../../logger/logger.mts';
import { rolesRequired } from '../../security/roles-required.mts';

const { krankenhausWriteService } = container;

export const router = new Hono();

const logger = getLogger('krankenhaus-write-router', 'file');

//Neu anlegen
const krankenhausDtoToKrankenhausCreateInput = (krankenhausDTO: KrankenhausNeuType): KrankenhausCreate => {
    const fachbereiche = krankenhausDTO.fachbereiche?.map((fachbereichDTO) => {
        const fachbereich = {
            name: fachbereichDTO.name,
        };
        return fachbereich;
    });
    const krankenhaus: KrankenhausCreate = {
        version: 0,
        name: krankenhausDTO.name,
        mitarbeiteranzahl: krankenhausDTO.mitarbeiteranzahl,
        bettenanzahl: krankenhausDTO.bettenanzahl,
        email: krankenhausDTO.email,
        adresse: {
            create: {
                strasse: krankenhausDTO.adresse.strasse,
                hausnummer: krankenhausDTO.adresse.hausnummer,
                plz: krankenhausDTO.adresse.plz,
                ort: krankenhausDTO.adresse.ort,
            },
        },
        fachbereiche: {
            create: fachbereiche ?? [],
        },
    };
    return krankenhaus;
};

router.post('/', rolesRequired('admin', 'user'), async (c) => {
    const requestBody = await c.req.json();

    const krankenhausDTO = KrankenhausType = KrankenhausNeuSchema.parse(requestBody);
    logger.debug('POST /: krankenhausDTO=%o', krankenhausDTO);

    const krankenhaus = krankenhausDtoToKrankenhausCreateInput(krankenhausDTO);
    const id = await krankenhausWriteService.create(krankenhaus);

    const location = `${createBaseUrl(c.req)}/${id}`;
    const { header, body } = c;
    header('Location', location);
    return body(null, 201);
});

// Update
const krankenhausDtoToKrankenhausUpdate = (krankenhausDTO: KrankenhausUpdateType): KrankenhausUpdate => {
    return{
        version: 0,
        name: krankenhausDTO.name,
        mitarbeiteranzahl: krankenhausDTO.mitarbeiteranzahl,
        bettenanzahl: krankenhausDTO.bettenanzahl,
        email: krankenhausDTO.email,
    };
};

router.put('/:id', rolesRequired('admin', 'user'), async (c) => {
    const { req } = c;
    const id = req.param('id') ?? '-1';
    logger.debug('put: id=%s', id);
    const idNumber = Number.parseInt(id, 10);
    if (Number.isNaN(idNumber)) {
        return c.notFound();
    }

    const version = req.header('If-Match');
    logger.debug('put: version=%s', version);
    if(version === undefined) {
        logger.debug('put: version ist undefined');
        return createProblemDetails(
            c,
            preconditionRequired,
            'Header "If-Match" ist erforderlich.',
        );
    }
    const requestBody = await c.req.json();
    logger.debug('put: requestBody=%o', requestBody);

    const krankenhausDTO = KrankenhausUpdateSchema.parse(requestBody);
    logger.debug('put: krankenhausDTO=%o', krankenhausDTO);

    const krankenhaus = krankenhausDtoToKrankenhausUpdate(krankenhausDTO);
    const neueVersion = await krankenhausWriteService.update({
        id: idNumber,
        krankenhaus,
        version,
    });
    logger.debug('put: neueVersion=%s', neueVersion);
    const headers = {
        ETAG: `"${neueVersion}"`,
    };
    return c.json(null, 204, headers);
});

// Löschen
router.delete('/:id', rolesRequired('admin'), async (c) => {
    const id = c.req.param('id') ?? '-1';
    logger.debug('delete: id=%s', id);
    const idNumber = Number.parseInt(id, 10);
    const { body } = c;
    if (Number.isNaN(idNumber)) {
        return body(null, 204);
    }

    await krankenhausWriteService.delete(idNumber);
    return body(null, 204);
}
);
