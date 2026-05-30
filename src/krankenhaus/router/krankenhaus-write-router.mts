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
    badRequest,
    createProblemDetails,
    preconditionRequired,
} from '../../problem-details.mts';
import { File } from 'node:buffer';
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
