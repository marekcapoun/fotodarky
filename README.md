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
