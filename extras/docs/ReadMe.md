# Hinweise zu AsciiDoctor und PlantUML

<!--
  Copyright (C) 2022 - present Juergen Zimmermann, Hochschule Karlsruhe

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
-->

[Juergen Zimmermann](mailto:Juergen.Zimmermann@h-ka.de)

Mit AsciiDoctor und PlantUML ist die Dokumentation geschrieben.

## Preview von PlantUML-Dateien

Um in VS Code die Erweiterung für PlantUML zu nutzen, wird eine Java-Installation
benoetigt, d.h. die Umgebungsvariable `JAVA_HOME` muss auf das Wurzelverzeichnis
der Java-Installation verweisen und die Umgebungsvariable `PATH` muss dieses
Verzeichnis einschliesslich dem Unterverzeichnis `bin` enthalten.

Durch das Tastaturkuerzel `<Alt>d` erhaelt man eine Preview-Sicht vom jeweiligen
UML-Diagramm. Dazu ist eine Internet-Verbindung notwendig.

## Einstellungen fuer Preview von AsciiDoctor-Dateien

Zunaechst muessen einmalig die Einstellungen (_Settings_) von VS Code geaendert
werden. Dazu klickt man in der linken unteren Ecke das Icon ("Raedchen") fuer die
Einstellungen an und waehlt den Menuepunkt _Einstellungen_ bzw. _Settings_ aus.
Dann gibt man im Suchfeld `asciidoc.use_kroki` ein und setzt den Haken bei
_Enable kroki integration to generate diagrams_.

Wenn man zum ersten Mal eine `.adoc`-Datei im Editor oeffnet, muss man noch
die Verbindung zum PlantUML-Server zulassen, damit die eingebundenen
`.plantuml`-Dateien in `.svg`-Dateien konvertiert werden. Dazu gibt man zunaechst
`<F1>` ein und schickt im Eingabefeld das Kommando
_AsciiDoc: Change Preview Security Settings_ durch `<Enter>` ab.
Danach waehlt man den Unterpunkt _Allow insecure content_ aus.

## Preview von AsciiDoctor-Dateien

Durch das Tastaturkuerzel `<Strg><Shift>v` erhaelt man die Preview-Ansicht.
Dazu ist eine Internet-Verbindung notwendig.

## Gesamte Dokumentation mit mkdocs

Um den Webserver von _mkdocs_ zu starten, ruft man `uv run mkdocs serve` auf.
Danach kann man den Webbrowser mit `http://localhost:8000` oeffnen.

Wenn man nur die HTML-Dokumentation generieren moechte, genuegt der Befehl
`uv run mkdocs build`.
