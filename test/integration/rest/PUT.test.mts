import {
    APPLICATION_JSON,
    AUTHORIZATION,
    BEARER,
    CONTENT_TYPE,
    IF_MATCH,
    PUT,
    restURL,
} from '../constants.mts';
import { beforeAll, describe, expect, test } from 'vitest';
import { type KrankenhausUpdateType } from '../../../src/krankenhaus/router/krankenhaus-validation.mts';
import { ProblemDetails } from '../../../src/problem-details.mts';
import { getToken } from '../token.mts';

//Testdaten

const geaendertesKrankenhaus: Omit<KrankenhausUpdateType, 'version'> = {
    name: 'Krankenhaus Test Geändert',
    mitarbeiteranzahl: 150,
    bettenanzahl: 75,
    email: 'post-test-geaendert@krankenhaus.de',
};
const idVorhanden = '20';

const geaendertesKrankenhausIDNichtVorhanden: Omit<KrankenhausUpdateType, 'version'> = {
    name: 'Krankenhaus Test Geändert',
    mitarbeiteranzahl: 150,
    bettenanzahl: 75,
    email: 'post-test-geaendert1@krankenhaus.de',
};
const idNichtVorhanden = '9999';


