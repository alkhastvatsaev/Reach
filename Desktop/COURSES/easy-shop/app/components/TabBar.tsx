
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, User } from 'lucide-react';

export default function TabBar() {
  const pathname = usePathname();
  
  const isHome = pathname === '/' || pathname === '/create-list';
  const isSearch = pathname.startsWith('/jobs');
  const isProfile = pathname === '/profile';

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '16px',
      right: '16px',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div className="mobile-tab-bar" style={{
        background: 'rgba(255, 255, 255, 0.45)', // Translucency
        backdropFilter: 'blur(35px) saturate(200%)',
        WebkitBackdropFilter: 'blur(35px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '999px',
        padding: '0 8px',
        height: '74px',
        maxWidth: '800px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <TabItem href="/" active={isHome} icon={ShoppingBag} label="Home" />
        <TabItem href="/jobs" active={isSearch} icon={Search} label="Explorer" />
        <TabItem href="/profile" active={isProfile} icon={User} label="Profil" />
      </div>
    </div>
  );
}

function TabItem({ href, active, icon: Icon, label }: any) {
  return (
    <Link href={href} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px',
      position: 'relative',
      textDecoration: 'none',
      color: active ? '#000' : 'rgba(128,128,128,0.7)',
      width: '64px'
    }}>
      <div style={{
        background: active ? 'linear-gradient(135deg, #00C6FF, #0072FF)' : 'transparent',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        opacity: active ? 1 : 0.6,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
         <Icon size={24} color={active ? 'white' : '#555'} strokeWidth={active ? 3 : 2} />
      </div>
      {active && (
        <span style={{
           position: 'absolute', bottom: '-8px', 
           width: '4px', height: '4px', background: '#0072FF', 
           borderRadius: '50%'
        }}></span>
      )}
    </Link>
  );
}
