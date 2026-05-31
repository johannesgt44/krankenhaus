import {
    type KrankenhausCreate,
    type KrankenhausUpdate,
} from '../service/krankenhaus-write-service.mts';
import { type KrankenhausMitAdresseUndFachbereichen } from '../service/krankenhaus-service.mts';
import { type Suchparameter } from '../service/Suhparameter.mts';

export type ID = string & { readonly __brand: 'ID' };
export type Int = number & { readonly __brand: 'Int' };

export const toID = (value: string | number): ID => {
    if (typeof value === 'string') {
        return value as ID;
    }
    return value.toSring() as ID;
};
export const toInt = (num: number): Int =>
    (Number.isInteger(num) ? num : Math.round(num)) as Int;
export const toNumber = (id: ID): number => Number.parseInt(id, 10);
const toDateOrNull = (dateStr?: string | null): Date | null =>
    dateStr === undefined || dateStr === null ? null : new Date(dateStr);

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
    }

    "Daten für ein neues Krankenhaus"
    input KrankenhausNeuInput {
        name: String!
        mitarbeiteranzahl: Int!
        bettenanzahl: Int!
        email: String
        adresse: AdresseInput!
    }

    "Daten für die Aktualisierung eines Krankenhauses"
    input KrankenhausUpdateInput {
        name: String!
        mitarbeiteranzahl: Int!
        bettenanzahl: Int!
        email: String!
        adresse: AdresseInput!
        fachbereiche: [FachbereichInput!]
    }

    "Daten für eine Adresse eines Krankenhauses"
    input AdresseInput {
        strasse: String!
        hausnummer: String!
        plz: String!
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
