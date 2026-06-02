/**
 * Das Modul `suchparameter` besteht aus Typdefinitionen für die Suche in `KrankenhausService`.
 * @packageDocumentation
 */

export type Suchparameter = {
    readonly name?: string;
    readonly mitarbeiteranzahl?: number;
    readonly bettenanzahl?: number;
    readonly ort?: string;
};

export const suchparameterNamen = [
    'name',
    'mitarbeiteranzahl',
    'bettenanzahl',
    'ort',
];
