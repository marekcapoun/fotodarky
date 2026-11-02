import {Camera} from 'lucide-react';
import type {MouseEventHandler} from 'react';

export default function BrandLogo({href='/',className='',onClick}:{href?:string;className?:string;onClick?:MouseEventHandler<HTMLAnchorElement>}){
 return <a href={href} className={`logo brand-logo ${className}`} onClick={onClick} aria-label="fotodárky.online — úvodní stránka"><span className="logo-icon" aria-hidden="true"><Camera size={21}/></span>fotodárky<span className="logo-online">.online</span></a>;
}
