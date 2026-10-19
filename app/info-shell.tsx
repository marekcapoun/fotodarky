import type {ReactNode} from 'react';
import SiteFooter from './site-footer';
export default function InfoShell({children}:{children:ReactNode}){return <div className="storefront"><header className="header info-header"><a href="/" className="logo">fotodárky<span className="logo-online">.online</span></a><nav aria-label="Hlavní navigace"><a href="/#produkty">Fotodárky</a><a href="/kontakt">Kontakty</a><a href="/obchodni-podminky">Obchodní podmínky</a></nav><a className="secondary" href="/">Zpět do obchodu</a></header>{children}<SiteFooter/></div>}
