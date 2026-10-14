# Ověření fotodarky.online — 14. 10. 2026

## Opravy

- Upload protokol se volí podle skutečného připojení úložiště. Tokenové připojení používá `upload`/`handleUpload`; OIDC připojení s webhook klíčem používá `uploadPresigned`/`handleUploadPresigned`.
- Klient dostává režim uploadu ze stejné serverové konfigurace jako upload endpoint. Neúplná konfigurace a nesoulad protokolů mají řízenou chybu.
- Opakované vydání upload tokenu se stejným návrhem je idempotentní. Přepsání intentu jinými parametry je zakázané.
- Přímé objednání uchovává návrh v košíku i při návratu z objednávkového formuláře.
- Tiskové PDF má jednotný limit 100 MB v klientu, upload tokenu i ověřovacím endpointu. Fotografie mají původní limit 25 MB.
- Velké kalendáře se stejně jako velké plakáty renderují po menších částech při 300 DPI.
- Opakované změny v administraci výslovně povolují přepsání existujícího JSON záznamu a současně kontrolují jeho ETag. Nové záznamy přepsání nepovolují.

## Živý zákaznický test na https://www.fotodarky.online/

| Postup | Výsledek |
| --- | --- |
| Nahrání syntetické JPG fotografie, kontrola DPI | Prošlo |
| Otočení, černobílá fotografie, obnovení výřezu | Prošlo |
| Magnetka 7 × 7 cm: PDF → soukromý Blob → košík | Prošlo |
| Změna množství na 5 kusů a sleva: 220 Kč | Prošlo |
| Opětovné načtení stránky, obnovení košíku a fotografie | Prošlo |
| Editace a nahrazení uložené magnetky | Prošlo |
| Fotoobraz 30 × 40 cm s osobním vzkazem | Prošlo |
| Přímé objednání → návrat do košíku bez ztráty návrhu | Prošlo |
| Plakát A0: blokování nízkého DPI bez potvrzení | Prošlo |
| Plakát A0: export, upload a serverové ověření PDF | Prošlo |
| Kalendář A3: hromadné nahrání 13 JPG, náhled 13 stran | Prošlo |
| Kalendář A3: export, upload a serverové ověření PDF | Prošlo |
| Košík se čtyřmi typy produktů, 8 kusů, celkem 2 017 Kč | Prošlo |
| Uložení objednávky a zobrazení potvrzení | Prošlo |
| Odstranění objednaných položek z košíku | Prošlo |
| Serverový upload token: limit 100 MB, pouze PDF, bez přepsání | Prošlo |
| Admin API bez přihlášení: data, objednávky, zákazníci, uživatelé a soubory | HTTP 401 |
| Zákaznická cesta ke stažení tiskových dat | HTTP 404 |
| Konfigurace relací a přístup k Blob | `ready: true` |

Živá objednávka **0121346107** je výhradně testovací. Jméno obsahuje **TEST AUTOMATICKÝ – NEVYRÁBĚT**, poznámka obsahuje **NEVYRÁBĚT, NEODESÍLAT, NEFAKTUROVAT**. Byly použity syntetické fotografie a e-mail `test@example.invalid`. Neproběhla platba ani odeslání e-mailu.

## Automatické funkční testy

`npm test` spouští skutečné serverové moduly s Blob adaptérem v paměti. Test tokenového uploadu používá skutečný `handleUpload` ze SDK; OIDC podpis a síťové úložiště jsou v těchto testech nahrazené adaptérem. PDF parsování používá skutečné `pdf-lib`.

- Všech 12 variant: kalendáře A4/A3, fotoobrazy 30 × 40/40 × 60/50 × 50 cm, magnetky 7 × 7/7 × 10/10 × 15 cm a plakáty A3/A2/A1/A0.
- Počet PDF stran, fyzické rozměry a cizí nebo neplatné návrhy.
- Limit PDF nad původními 30 MB a zamítnutí metadat nad 100 MB.
- Oba upload protokoly, chybějící klíč, opakovaný token, vlastnictví a kontrola Origin.
- Kombinovaná objednávka 12 položek, výpočet ceny na serveru, slevy, validace kontaktů a množství.
- Obnova po chybě zápisu a opakování objednávky bez duplicity.
- Registrace prvního správce, uzavření bootstrapu, schvalování uživatelů a role.
- Přihlášení, podepsané cookies, odmítnutí podvržené relace, CSRF, rate limit a odhlášení.
- Opakované změny stavu objednávky, zákazníka a uživatelských oprávnění; konflikty starých ETag.
- Vazby zákazníků a souborů na objednávky, chráněný přístup k PDF a ochrana souborů použitých v objednávce.

`npm run build` prošel včetně TypeScript kontroly.

## Omezení ověření a zbývající konfigurace

- Platební účet (`PAYMENT_IBAN`) není nastaven. Produkční QR platbu nelze bez účtu ověřit ani použít. Objednávka se uloží a rozhraní tuto skutečnost zobrazí.
- Přihlášené administrační operace byly ověřeny automatickými funkčními testy s adaptérem Blob. Živý test nezasahoval do uživatelských účtů; na produkci bylo ověřeno nastavení a odmítnutí nepřihlášeného přístupu.
- Živý prohlížeč byl desktopový Chrome. Nebyl proveden test na fyzickém telefonu ani úplný audit vzhledu ve všech prohlížečích.
