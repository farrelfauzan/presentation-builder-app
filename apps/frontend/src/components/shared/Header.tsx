'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@presentation-builder-app/libs';
import { LayoutDashboard, Settings, Presentation } from 'lucide-react';

const navItems = [
  { href: '/dashboard/projects', label: 'Projects', icon: LayoutDashboard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center px-6 gap-6">
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <Presentation className="h-5 w-5" />
          <span>Presentation Builder</span>
        </Link>

        <nav className="flex items-center gap-1 ml-6">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
