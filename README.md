# fotodárky.online

Fotodárky s vlastním návrhem: kalendáře (13 stran), fotoobrazy, magnetky a plakáty. Průvodce formátem, vzhledem a fotografiemi, kontrola DPI, košík, objednávka a QR platba.

Projekt je připraven pro **Vercel / Next.js**, bez závislosti na Cloudflare Workers nebo ChatGPT přihlášení. Původní nasazená verze na ChatGPT Sites se touto úpravou nemění.

## Nasazení

1. Na Vercel importujte repozitář `marekcapoun/fotodarky` a větev `main`.
2. Framework **Next.js**, Root Directory ponechte prázdný; Node.js **22.x**. Build a instalaci určuje `vercel.json`.
3. V **Storage** vytvořte Blob store s přístupem **Private** a připojte ho k projektu. Vercel doplní `BLOB_READ_WRITE_TOKEN`. Veřejný Blob store nepoužívejte pro tisková data.
4. V Environment Variables nastavte `SESSION_SECRET` (nejméně 32 náhodných znaků, například výsledek `openssl rand -hex 32`). Nastavte ho pro všechna prostředí, která chcete použít.
5. Volitelně nastavte `PAYMENT_IBAN` na správný účet příjemce. Bez účtu aplikace uloží objednávku, ale QR platba zůstane vypnutá.
6. Proveďte Deploy / Redeploy. Při změně proměnných je potřeba nové nasazení. Soukromé testování můžete zachovat pomocí Vercel Deployment Protection.

Po nasazení vyzkoušejte nahrání fotografie, vložení do košíku, objednání více produktů a vznik PDF i objednávkového JSON v soukromém Blob store. Návrhy a objednávky z původního Sites úložiště se automaticky nepřenášejí.

## Lokální spuštění

```bash
npm ci
cp .env.example .env.local
# Doplňte hodnoty do .env.local. Token získáte z privátního Blob store.
npm run dev
```

`npm run build` vytvoří produkční aplikaci, `npm start` ji spustí. Pro přímé nahrávání je třeba Blob token i lokálně; dokončení a ověření návrhu volá přímo prohlížeč, nezávisí na dostupnosti callbacku na localhostu.

## Ukládání tiskových dat

PDF se nahrává přímo z prohlížeče do **Private Vercel Blob**. Přes server prochází jen token a malé JSON požadavky. Tím se řeší limit 4,5 MB běžných serverových požadavků Vercel; aplikace připouští tiskový soubor do 30 MB. Server před přijetím návrhu kontroluje velikost souboru, typ, počet stran a fyzické rozměry PDF.

Zákaznické relace se podepisují pomocí `SESSION_SECRET` a ukládají do HttpOnly/SameSite cookie. Zákazník může objednat jen svoje návrhy. Tisková data nemají zákaznickou stahovací API cestu. Provozovatel je najde ve Vercel dashboardu v soukromém Blob store:

- `print/<relace>/<návrh>.pdf` — výrobní data.
- `data/<relace>/designs/<návrh>.json` — schválený návrh a konfigurace.
- `data/<relace>/orders/<objednávka>.json` — zákaznické údaje, číslo kalkulace, položky, ceny a výrobní klíče PDF.
- `data/<relace>/intents/<návrh>.json` — povolení nahrání.

Uložená objednávka má jedno číslo / VS a společnou cenu. Platba se ověřuje ručně, emaily nejsou zapojené. Košík a původní fotografie pro další editaci se ukládají do IndexedDB tohoto prohlížeče; nejsou sdílené mezi zařízeními. Cookies mají platnost 30 dní. Po smazání cookie nebo změně SESSION_SECRET je potřeba návrh otevřít a znovu vložit do košíku.

## Ceník a výroba

Ceny v `app/catalog.ts` jsou **ukázkové**, včetně DPH, bez dopravy. Před prodejním provozem doplňte skutečný ceník a předání. Slevy platí pro každý návrh zvlášť. Výpočet konečné ceny probíhá na serveru.

PDF: 300 DPI, RGB, raster s JPEG kompresí, TrimBox a BleedBox. Kalendář, magnetka a plakát: 3 mm přesah. Plátno: 20 mm pro zahnutí na každé straně. Nejde o certifikované PDF/X; profil, materiál, vazbu a přesahy je třeba ověřit s tiskárnou. Nové produkty se definují v `app/catalog.ts` a ve vykreslování `app/render-product.ts`.

## Doména

Po nasazení přidejte vlastní doménu v **Settings → Domains** a nastavte DNS podle údajů Vercel. Tato příprava doménu nepřipojuje ani nezakládá Vercel projekt.

## Administrace `/admin`

Administrace je chráněná vlastním přihlášením. Zákaznická relace z e-shopu k ní přístup nedává. Správce má přehled:

- objednávky: hledání, filtrování, detail položek, stavy Přijato / Ve výrobě / Připraveno / Odesláno / Dokončeno / Zrušeno, ruční potvrzení platby a interní poznámky;
- zákazníci: automatické seskupení původních objednávek podle e-mailu, vlastní kontakty, úprava údajů, poznámky, archivace a historie nákupů;
- soubory: vyhledávání podle názvu a objednávky, soukromý náhled a stažení tiskových PDF, odstranění nepřiřazených návrhů po potvrzení. Soubory přiřazené k objednávce jsou chráněné před smazáním.

### Vytvoření prvního administrátora v prohlížeči

Není potřeba instalovat Node.js ani vytvářet hash hesla v příkazovém řádku.

1. Ponechte nastavené `SESSION_SECRET` a soukromé Blob úložiště (`BLOB_READ_WRITE_TOKEN`).
2. Ve Vercel nastavte `ADMIN_SETUP_TOKEN` na vlastní tajný instalační kód o alespoň 16 znacích a proveďte Redeploy.
3. Otevřete `<vaše-doména>/admin`, zvolte **Vytvořit účet**, oprávnění **Administrátor**, vyplňte jméno, e-mail, heslo (alespoň 12 znaků), jeho potvrzení a instalační kód.
4. První správce se vytvoří a automaticky přihlásí. Poté můžete `ADMIN_SETUP_TOKEN` z Vercel odstranit. Po odstranění proveďte nové nasazení.

Veřejné vytvoření administrátora se uzamkne při založení prvního účtu a neotevře se znovu deaktivací účtu. Při souběžném založení je první administrátor rezervován jedinečným záznamem v úložišti. Pokud uložení účtu selže po rezervaci, dokončete založení se stejným e-mailem a instalačním kódem.

### Další uživatelé a administrátoři

- V loginu může návštěvník vytvořit účet **Uživatel**; takový účet čeká na schválení a nemá přístup k objednávkám ani souborům.
- Přihlášený administrátor v sekci **Uživatelské účty** schválí či deaktivuje účet, změní oprávnění nebo vytvoří dalšího uživatele / administrátora přímo jako aktivní účet.
- Uživatel má provozní přístup k objednávkám, kontaktům a souborům. Jen administrátor spravuje uživatelské účty a může přidávat administrátory.
- Změna oprávnění nebo deaktivace zneplatní dosavadní přihlášení daného účtu. Správce si nemůže odebrat vlastní administrátorský přístup.
- Hesla se automaticky ukládají jako osolené scrypt hashe. API seznamu účtů heslové hashe nevrací.

Původní přihlášení pomocí `ADMIN_EMAIL` a `ADMIN_PASSWORD_HASH` je stále podporované, pokud tyto proměnné už používáte. Původní správce se přihlásí a založí nové účty v sekci Uživatelské účty. Samostatně vytvářený hash už není potřeba pro nové účty; skript `npm run admin:password` zůstává pro starý způsob nastavení.

Přihlášení platí osm hodin, používá HttpOnly/SameSite cookie a je ověřováno přímo na každém admin API. Odhlášení zneplatní uloženou relaci. Změna SESSION_SECRET zneplatní staré přihlášení. Přihlášení a registrace jsou omezené na deset pokusů za patnáct minut pro danou IP. Uživatelské účty se ukládají pod `admin/users/`, rezervace prvního správce pod `admin/bootstrap.json`.

Administrace automaticky načte i objednávky, které už jsou ve stávajícím Vercel Blob store. Data z původního Sites úložiště tím nejsou migrována.

Změny stavu a plateb jsou oddělené od původního objednávkového JSON; administrace nemění částky ani odeslané objednávkové údaje. Kontakt lze upravit, ale původní kontaktní snímek v objednávce se nepřepisuje. Při souběžném uložení se kontroluje ETag a aplikace odmítne přepsat novější změnu jiného otevřeného okna. Platební stav nastavuje správce, není připojené bankovní párování.

Interní záznamy se ukládají pod `admin/orders/`, `admin/customers/`, `admin/sessions/` a `admin/login-attempts/` v soukromém Blob store. API neposkytuje zákazníkům přímé adresy tiskových souborů. Administrace streamuje PDF přes chráněnou cestu `/api/admin/files`.

Ověření: `npm test` spouští funkční testy admin modulů nad paměťovým adaptérem Blob (přihlášení, ochrana API, stav a platba, kontakty, soubory, konfliktní zápis, odhlášení). `npm run build` kontroluje TypeScript a produkční sestavení. Testy nezapisují do skutečného Vercel úložiště.
