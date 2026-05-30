import { z } from 'zod';

export const MAX_VARCHAR_LENGTH = 40;

const idSchema = z.union([
    z.number().int().gt(0),
    z.string().regex(/^[1-9]\d*$/u),
]);

const varcharSchema = z
    .string()
    .regex(/^\S.*$/u)
    .max(MAX_VARCHAR_LENGTH);
const nonNegativeIntSchema = z.int().gte(0);

const AdresseSchema = z.strictObject({
    strasse: varcharSchema,
    hausnummer: varcharSchema,
    plz: z.string().regex(/^\d{5}$/u),
    ort: varcharSchema,
});

const FachbereichSchema = z.strictObject({
    name: varcharSchema,
    beschreibung: varcharSchema.optional(),
    leitung: varcharSchema.optional(),
    anzahlaerzte: nonNegativeIntSchema.optional(),
});

const KrankenhausComplete = z.strictObject({
    // Bei GraphQL ist der Typ ID i.a. ein String.
    id: idSchema,
    version: z.int().gte(0),
    name: varcharSchema,
    mitarbeiteranzahl: nonNegativeIntSchema,
    bettenanzahl: nonNegativeIntSchema,
    email: z.email().max(MAX_VARCHAR_LENGTH),
    adresse: AdresseSchema,
    fachbereiche: z.array(FachbereichSchema),
});

export const KrankenhausNeuSchema = KrankenhausComplete.omit({
    id: true,
    version: true,
}).readonly();

export const KrankenhausUpdateSchema = KrankenhausComplete.omit({
    id: true,
    version: true,
    adresse: true,
    fachbereiche: true,
}).readonly();

export const KrankenhausUpdateGraphQLSchema = KrankenhausComplete.omit({
    adresse: true,
    fachbereiche: true,
}).readonly();

export type KrankenhausNeuType = z.infer<typeof KrankenhausNeuSchema>;
export type KrankenhausUpdateType = z.infer<typeof KrankenhausUpdateSchema>;
