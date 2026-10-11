# fotodárky.online

Produktový katalog, průvodce a košík pro kalendáře, fotoobrazy, magnetky a plakáty.

## Produkty a ceník

Produktové definice jsou centralizované v app/catalog.ts. Přidání produktu vyžaduje rozměry, materiálový přesah, počet stran, základní cenu a vykreslení daného produktu; košík a objednávka zpracovávají produkty obecně.

Ceny jsou ukázkové, včetně DPH, bez dopravy. Množstevní slevy od 5/10/20/50 ks: 10/15/20/25 %. Platí pro každý návrh zvlášť. Server načítá cenu z katalogu, ne z částky zaslané zákazníkem. Před veřejným provozem schválit skutečné ceny, dopravu a obchodní podmínky.

## Košík a objednávky

- Přidání do košíku i přímá objednávka vytváří interní PDF a ukládá je na server. Kontaktní údaje se ukládají při dokončení objednávky.
- R2 BUCKET: designs/UUID.pdf jsou tisková data; designs/UUID.json je vlastník, konfigurace a potvrzení nízkého DPI. orders/UUID.json obsahuje kontaktní údaje, položky, ceny, odkazy na interní tiskové klíče, číslo kalkulace/VS a datum.
- Tisková PDF nemají zákaznickou adresu pro stažení. Původní zákaznická cesta /api/quotes/:id vrací 404, také pro historické kalendáře.
- Košík a editovatelné fotografie se ukládají v IndexedDB pro daný prohlížeč. Při obnovení se vrátí košík; jeho návrhy lze otevřít k editaci. Fotografie rozpracovaného produktu mimo košík jsou dočasné. Prohlížečový košík není synchronizovaný mezi zařízeními. Návrhy a tiskové PDF už vložených položek jsou na serveru.
- Úprava položky vytvoří novou verzi tiskových dat a nahradí košíkovou položku. Opuštěné návrhy zatím nemají automatické promazávání.
- Přímá objednávka zahrnuje právě připravený produkt. Objednávka košíku zahrnuje všechny jeho položky.
- Jeden serverový výpočet a společná QR platba za celou objednávku. Opakování stejného requestId vrací uloženou objednávku. Zákaznické ceny se nikdy nepoužívají jako autoritativní částky.

## Platby a přístup

Nastavit serverovou proměnnou PAYMENT_IBAN na účet provozovatele v IBAN. Dokud chybí, QR platby jsou vypnuté. QR používá SPD 1.0, CZK, serverovou celkovou částku a desetimístné číslo objednávky jako VS. Přijetí platby se ověřuje ručně. Emailová potvrzení nejsou zapojena.

Web zůstává soukromý a vyžaduje přihlášení. Vlastní doména fotodarky.online není připojena automaticky; vyžaduje správu DNS a hostingové nastavení. Název značky není důkaz dostupnosti ani vlastnictví domény.

## Tisk

PDF vzniká na klientovi a server ověřuje počet a fyzické rozměry stran. Raster 300 DPI, RGB, JPG 92 %, bez certifikace PDF/X a profilu tiskárny. Kalendář 13 stran, ostatní produkty jedna strana. Kalendář, magnetky a plakáty mají 3 mm přesah. Fotoobrazy mají 20 mm pro zahnutí plátna na každé straně; náhled přední plochy přesně ořezává stejný tiskový návrh. Před výrobou schválit přesahy, konstrukci obrazu, vazbu, materiál a barevný profil.

DPI respektuje otočení, výřez, přiblížení a prostor pro zahnutí. Pod 150 DPI nutné zákaznické potvrzení. Podporovány JPG/PNG/WebP do 25 MB/fotografie, výsledný PDF do 30 MB. Žádná zákaznická možnost exportu nebo stahování PDF.

## Ilustrační motivy

Lokální demonstrační fotografie z Unsplash: photo-1464822759023-fed622ff2c3b (hory) a photo-1476514525535-07fb3b4ae5f1 (jezero). Slouží pouze produktovým náhledům, nevkládají se automaticky do zákaznického návrhu.

## Ověření

Produkční build a TypeScript. Funkční kontroly katalogových cen, DPI a kalendářů, přední plochy vůči tiskovým datům, backendových vícepoložkových objednávek, opakovaného odeslání a odmítnutí cizích návrhů. Browser QA není dostupné v prostředí.
