import {cookies} from 'next/headers';
import {adminOf,adminConfigured,setupAvailable} from '../../lib/admin-auth';
import {AdminConsole} from './ui';
import {AccountLogin} from './accounts';
import './admin.css';
export const dynamic='force-dynamic';export const runtime='nodejs';
export default async function AdminPage(){const cookie=(await cookies()).toString();const admin=await adminOf(new Request('http://admin.local',{headers:{cookie}}));return admin?<AdminConsole email={admin.email} role={admin.role}/>:<AccountLogin configured={adminConfigured()} setupAllowed={await setupAvailable().catch(()=>false)} setupCodeConfigured={(process.env.ADMIN_SETUP_TOKEN?.length||0)>=16}/>;}
