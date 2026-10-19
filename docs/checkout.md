# Standardní objednávka a zákaznické účty

Objednávka vyžaduje e-mail, telefon a fakturační adresu (jméno, příjmení, ulice s číslem, město, PSČ, země). Volitelně obsahuje firmu, IČO, DIČ, jinou doručovací adresu a poznámku. Zatím je podporované doručení v České republice.

Doprava je definovaná v `app/checkout-data.ts`: osobní odběr 0 Kč, kurýr na adresu 129 Kč. Jde o ručně vyřizované způsoby dopravy bez automatického objednání přepravy u dopravce. Server určuje cenu dopravy a celkovou částku podle vlastní konfigurace; cenu z klienta nepřebírá. Součet produktů a dopravy se používá i pro QR platbu, pokud je nastaven PAYMENT_IBAN.

Registrace je volitelná v objednávce a samostatně na `/ucet`. Přihlášený zákazník má předvyplněné údaje a vidí jen objednávky skutečně připojené k jeho účtu. Dřívější hostovské objednávky se automaticky nespojují podle neověřeného e-mailu. Zákaznický účet neuděluje přístup do administrace.

Účty, relace a reference objednávek jsou v soukromém Blob úložišti v odděleném prefixu `customers/`. Hesla mají nejméně 12 znaků a ukládají se jako scrypt hash s náhodnou solí. Relace má podepsanou HttpOnly cookie a záznam na serveru, odhlášení záznam odvolá. POST požadavky kontrolují Origin a registrační/přihlašovací endpointy mají limit pokusů. Heslo se neukládá do objednávky ani košíku a nevrací se v API.

Rozpracovaný formulář se zachovává při návratu do košíku v téže otevřené stránce. Heslo se při návratu nezachovává.

Funkční testy (`npm test`) pokrývají hosta, firemní a jinou dodací adresu, PSČ a telefon, výpočet dopravy na serveru, registraci, přihlášení, odhlášení, oddělení historie účtů, ochranu proti podvrženým cookies, CSRF a zachování původních testů produktů i administrace.
