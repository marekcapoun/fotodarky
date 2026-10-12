import {cookies} from 'next/headers';
import {adminOf,adminConfigured} from '../../lib/admin-auth';
import {AdminConsole,AdminLogin} from './ui';
import './admin.css';
export const dynamic='force-dynamic';export const runtime='nodejs';
export default async function AdminPage(){const cookie=(await cookies()).toString();const admin=await adminOf(new Request('http://admin.local',{headers:{cookie}}));return admin?<AdminConsole email={admin.email}/>:<AdminLogin configured={adminConfigured()}/>;}
