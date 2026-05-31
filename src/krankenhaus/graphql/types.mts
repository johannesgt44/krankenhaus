import {
    type KrankenhausCreate,
    type KrankenhausUpdate,
} from '../service/krankenhaus-write-service.mts';
import { type KrankenhausMitAdresse } from '../service/krankenhaus-service.mts';
import { type Suchparameter } from '../service/suchparameter.mts';

export type ID = string & { readonly __brand: 'ID' };
export type Int = number & { readonly __brand: 'Int' };

export const toID = (value: string | number): ID => {
    if (typeof value === 'string') {
        return value as ID;
    }
    return value.toString() as ID;
};
export const toInt = (num: number): Int =>
    (Number.isInteger(num) ? num : Math.round(num)) as Int;
export const toNumber = (id: ID): number => Number.parseInt(id, 10);

// -----------------------------------------------------------------------------
// GraphQL Schema
// -----------------------------------------------------------------------------
export const typeDefs = /* GraphQL */ `
    "Krankenhausdaten lesen"
    type Query {
        krankenhaus(id: ID!): Krankenhaus!
        krankenhaeuser(input: SuchparameterInput): [Krankenhaus!]!
    }

    "Krankenhäuser neu anlegen, aktualisieren oder löschen"
    type Mutation {
        create(input: KrankenhausNeuInput!): CreatePayload!
        update(input: KrankenhausUpdateInput!): UpdatePayload
        delete(id: ID!): DeletePayload
        token(username: String!, password: String!): TokenPayload
    }

    "Datenschema zu einem Krankenhaus, das gelesen wird"
    type Krankenhaus {
        id: ID!
        version: Int!
        name: String!
        mitarbeiteranzahl: Int!
        bettenanzahl: Int!
        email: String
        adresse: Adresse!
    }

    "Daten zur Adresse eines Krankenhauses"
    type Adresse {
        strasse: String!
        hausnummer: String!
        plz: String!
        ort: String!
    }

    "Generierte ID beim erfolgreichen Neuanlegen"
    type CreatePayload {
        id: ID!
    }

    "Neue Versionsnummer bei erfolgreichem Aktualisieren"
    type UpdatePayload {
        version: Int!
    }

    "Flag, ob das Löschen erfolgreich war"
    type DeletePayload {
        success: Boolean!
    }

    "Access- und Refresh-Token einschließlich Ablauf-Zeitstempel"
    type TokenPayload {
        access_token: String!
        expires_in: Int!
        refresh_token: String!
        refresh_expires_in: Int!
    }

    "Suchparameter für Krankenhäusern"
    input SuchparameterInput {
        name: String
        mitarbeiteranzahl: Int
        bettenanzahl: Int
        ort: String
    }

    "Daten für ein neues Krankenhaus"
    input KrankenhausNeuInput {
        name: String!
        mitarbeiteranzahl: Int!
        bettenanzahl: Int!
        email: String
        adresse: AdresseInput!
        fachbereiche: [FachbereichInput!]
    }

    "Daten für einen Fachbereich eines Krankenhauses"
    input FachbereichInput {
        name: String!
        beschreibung: String
        leitung: String
        anzahlaerzte: Int
    }

    "Daten für eine Adresse eines Krankenhauses"
    input AdresseInput {
        strasse: String
        hausnummer: String
        plz: String
        ort: String!
    }

    "Daten für ein zu änderndes Krankenhaus"
    input KrankenhausUpdateInput {
        id: ID!
        version: Int!
        name: String!
        mitarbeiteranzahl: Int!
        bettenanzahl: Int!
        email: String
    }
`;

// ----------------------------------------------------------------------------
// Suche
// ----------------------------------------------------------------------------
export type Krankenhaus = {
    id: ID;
    version: Int;
    name: string;
    mitarbeiteranzahl: Int;
    bettenanzahl: Int;
    email: string;
    adresse: {
        strasse: string;
        hausnummer: string;
        plz: string;
        ort: string;
    };
};

export const toKrankenhausType = (
    krankenhaus: KrankenhausMitAdresse,
): Krankenhaus => {
    const result: Krankenhaus = {
        id: toID(krankenhaus.id),
        version: toInt(krankenhaus.version),
        name: krankenhaus.name,
        mitarbeiteranzahl: toInt(krankenhaus.mitarbeiteranzahl ?? 0),
        bettenanzahl: toInt(krankenhaus.bettenanzahl ?? 0),
        email: krankenhaus.email,
        adresse: {
            strasse: krankenhaus.adresse?.strasse ?? 'N/A',
            hausnummer: krankenhaus.adresse?.hausnummer ?? 'N/A',
            plz: krankenhaus.adresse?.plz ?? 'N/A',
            ort: krankenhaus.adresse?.ort ?? 'N/A',
        },
    };
    return result;
};

export type SuchparameterInput = {
    name?: string | undefined;
    mitarbeiteranzahl?: Int | undefined;
    bettenanzahl?: Int | undefined;
    ort?: string | undefined;
};

export const toSuchparameter = (param?: SuchparameterInput) => {
    if (param === undefined) {
        return null;
    }

    const { name, mitarbeiteranzahl, bettenanzahl, ort } = param;
    const suchparameter: Record<string, any> = {};
    if (name !== undefined) {
        suchparameter['name'] = name;
    }
    if (mitarbeiteranzahl !== undefined) {
        suchparameter['mitarbeiteranzahl'] = mitarbeiteranzahl;
    }
    if (bettenanzahl !== undefined) {
        suchparameter['bettenanzahl'] = bettenanzahl;
    }
    if (ort !== undefined) {
        suchparameter['ort'] = ort;
    }
    return suchparameter as Suchparameter;
};

// ----------------------------------------------------------------------------
// Neuanlegen
// ----------------------------------------------------------------------------
export type KrankenhausNeuInput = {
    name: string;
    mitarbeiteranzahl: Int;
    bettenanzahl: Int;
    email: string;
    adresse: { strasse: string; hausnummer: string; plz: string; ort: string };
    fachbereiche?: {
        name: string;
        beschreibung: string;
        leitung: string;
        anzahlaerzte: Int;
    }[];
};

export const toCreate = (input: KrankenhausNeuInput): KrankenhausCreate => {
    const {
        name,
        mitarbeiteranzahl,
        bettenanzahl,
        email,
        adresse,
        fachbereiche,
    } = input;
    const krankenhausCreate: KrankenhausCreate = {
        version: 0,
        name,
        mitarbeiteranzahl,
        bettenanzahl,
        email,
        adresse: {
            create: {
                strasse: adresse.strasse,
                hausnummer: adresse.hausnummer,
                plz: adresse.plz,
                ort: adresse.ort,
            },
        },
        fachbereiche: {
            create: (fachbereiche ?? []).map(
                ({ name: fachbereichName, beschreibung, leitung, anzahlaerzte }) => {
                    return { name: fachbereichName, beschreibung, leitung, anzahlaerzte };
                },
            ),
        },
    };
    return krankenhausCreate;
};

export type CreatePayload = {
    id: ID;
};

// ----------------------------------------------------------------------------
// Aktualisieren
// ----------------------------------------------------------------------------
export type KrankenhausUpdateInput = Omit<KrankenhausNeuInput, 'adresse' | 'fachbereiche'> & {
    id: ID;
    version: Int;
};

export const toUpdate = (krankenhaus: KrankenhausUpdateInput): KrankenhausUpdate => {
    const { version, name, mitarbeiteranzahl, bettenanzahl, email } = krankenhaus;
    const krankenhausUpdate: KrankenhausUpdate = {
        version,
        name,
        mitarbeiteranzahl,
        bettenanzahl,
        email,
    };
    return krankenhausUpdate;
};

export type UpdatePayload = {
    readonly version: Int;
};

// ----------------------------------------------------------------------------
// Löschen
// ----------------------------------------------------------------------------
export type DeletePayload = {
    readonly success: boolean;
};

// ----------------------------------------------------------------------------
// Security
// ----------------------------------------------------------------------------
export type TokenPayload = {
    readonly access_token: string;
    readonly expires_in: Int;
    readonly refresh_token: string;
    readonly refresh_expires_in: Int;
};
