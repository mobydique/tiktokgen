'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Video,
  PlayCircle,
  Sparkles,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Character Profiles', href: '/character-profiles', icon: Users },
  { name: 'Text Templates', href: '/text-templates', icon: FileText },
  { name: 'Videos', href: '/videos', icon: Video },
  { name: 'Generate', href: '/videos/generate', icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 text-white shadow-lg">
            <PlayCircle className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
            TikTokGen
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'scale-110 transition-transform')} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
