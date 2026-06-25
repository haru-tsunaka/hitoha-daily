'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
        if (data?.display_name) setDisplayName(data.display_name);
      }
    };
    if (pathname !== '/login') fetchProfile();
  }, [pathname]);

  if (pathname === '/login') return null;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="bg-navy sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex flex-col">
            <span className="font-serif text-white text-base font-bold tracking-wider leading-tight">Hitoha Daily</span>
            <span className="text-white/35 text-[9px] tracking-wide leading-tight hidden md:block">繋叶 -- いまと、これからを、ひとはにのせて。</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className={`text-sm py-2 transition-colors ${
                pathname === '/' ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              Today
            </Link>
            <Link
              href="/report"
              className={`text-sm py-2 transition-colors ${
                pathname === '/report' ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              Report
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {displayName && (
            <span className="text-white/60 text-xs hidden sm:block">{displayName}</span>
          )}
          <button
            onClick={handleLogout}
            className="text-white/50 hover:text-white/80 text-xs tracking-wide transition-colors py-2 pl-4"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
