# Verze editoru

- **v1.0** — `editor-v1.0-before-redesign` (`07ac323`): výchozí připravená verze, černý podklad, vlastní barvy, Fotogalerie. Produkce zůstává na větvi main. Trvalá záloha stejného obsahu na GitHubu: větev `archive/editor-v1.0`.
- **v2.0** — větev `draft/editor-v2`: rozšířený editor pro testování. Bez publikace do produkce.

## Návrat

Po naklonování repozitáře lze výchozí verzi otevřít přes `git switch archive/editor-v1.0`. V původním pracovním adresáři také příkazem `git switch --detach editor-v1.0-before-redesign`. Pro vrácení konkrétní změny použijte `git revert <commit>`; nepřepisujte historii. Rozpracované změny vždy nejdříve commitněte nebo uložte do stash.

Rozpracované návrhy mají verzi dat a ukládají se odděleně od košíku. Starší konfigurace bez nových nastavení zůstávají podporované. Návrhy s kolážemi vyžadují v2; při návratu aplikace nepřepisujte jejich uložená data.

## v2.0 – rozsah a ověření

- Oddělené záložky Šablony / Rozložení / Kalendárium / Barvy a text, tematické filtrování.
- Koláže 1–4 fotografií, stabilní identita míst při změně rozložení. Přebytečné nahrané fotografie zůstávají v knihovně projektu.
- Vzhled pro celý kalendář nebo jednu stranu, obnovení společného vzhledu, kopírování na vybrané strany.
- Výřez tažením i přesnými posuvníky, kontextové nástroje, změna pořadí fotografií přetažením náhledů stran, bezpečné zóny.
- DPI samostatně pro každý rámeček, 13 tiskových stran, stejná geometrie pro náhled a interní PDF.
- Vlastní popisek strany, rodinný plánovač se 2–6 členy, opakované osobní události. Dlouhé seznamy se v náhledu i tisku označeně zkracují; 29. únor je pouze v přestupném roce. Galerie zachovává pouze číselnou lištu.
- Automatické ukládání do samostatné IndexedDB, Moje projekty, Zpět/Znovu (40 kroků, seskupení rychlých změn). Uložení je místní, nikoli synchronizace mezi zařízeními.
- Přenos z telefonu přes QR: podepsaný odkaz na 15 minut, soukromý Blob, obě podporované autentizační metody, JPG/PNG/WebP do 25 MB, načítání pouze vlastníkem relace. Ukončení přenosu odstraní dočasné snímky; zavření editoru provede také pokus o ukončení. Při náhlém odpojení mohou dočasná data zůstat v Blob; před produkčním spuštěním doporučena pravidelná údržba. Již vydané upload tokeny mají doběh nejvýše 5 minut, odkaz nevydá nové tokeny po uzavření.
- Produkční main zůstává beze změn. Zákaznické stažení tiskového PDF není přidané.

## Testování

`npm run typecheck`, `npm test`, `npm run build`.

Testy: původní administrace/objednávky, koláže ve všech formátech a umístěních, soulad DPI a rámů, náhled/tisk, vlastní vzhled stran a globální datum, rodinné události, validace nových konfigurací při ukládání PDF; podpis/expirace QR, vlastnictví, cesty a vydání Blob tokenu přes skutečný handler s testovacím úložištěm. Testy neposílají skutečné e-maily ani objednávky.

Samostatný interaktivní návrh: `node scripts/build-editor-preview.cjs`, výstup `out/fotokalendar-editor-v2.html`. Otevřít v běžném prohlížeči. Tento náhled umožňuje tvorbu kalendáře, ukládání a návraty změn; serverové objednávání a přenos QR vyžadují celou aplikaci.

V tomto prostředí nelze spustit browser QA: spravovaný spouštěč předává Next.js neplatné `--host` a `--strictPort`. Testy v reálném mobilním prohlížeči, QR mezi dvěma zařízeními a finální vizuální kontrola jsou určeny pro testovací nasazení.

Doporučený ruční scénář: A4 → šablona → koláž 4 snímků → nahrát dávku fotografií → upravit výřez → změnit pouze březen → zkopírovat na duben → Zpět/Znovu → obnovit projekt po reloadu → A3 → zkontrolovat DPI → náhled všech 13 stran. Na serveru pak ověřit QR dvěma zařízeními a objednávku s testovacími kontakty.
