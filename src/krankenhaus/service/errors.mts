// oxlint-disable max-classes-per-file
// Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

/**
 * Das Modul besteht aus den Klassen fuer die Fehlerbehandlung bei der Verwaltung
 * von Krankenhaeusern, z.B. beim DB-Zugriff.
 * @packageDocumentation
 */

/**
 * Error-Klasse fuer ein nicht gefundenes Krankenhaus.
 */
export class NotFoundError extends Error {}

/**
 * Error-Klasse fuer eine ungueltige Versionsnummer beim Aendern.
 */
export class VersionInvalidError extends Error {
    readonly version: string | undefined;

    constructor(version: string | undefined) {
        super(`Die Versionsnummer ${version} ist ungueltig.`);
        this.version = version;
    }
}

/**
 * Error-Klasse fuer eine veraltete Versionsnummer beim Aendern.
 */
export class VersionOutdatedError extends Error {
    readonly version: number;

    constructor(version: number) {
        super(`Die Versionsnummer ${version} ist nicht aktuell.`);
        this.version = version;
    }
}

/**
 * Error-Klasse fuer eine bereits existierende Email-Adresse.
 */
export class EmailExistsError extends Error {
    readonly email: string;

    constructor(email: string) {
        super(`Die Email-Adresse ${email} existiert bereits.`);
        this.email = email;
    }
}
