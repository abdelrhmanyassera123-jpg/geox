'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  FileBarChart,
  LogOut,
  Menu,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '../ui/sheet';
import { useState } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

const routes = [
  {
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-blue-500',
  },
  {
    label: 'المشاريع',
    icon: FolderKanban,
    href: '/projects',
    color: 'text-sky-500',
  },
  {
    label: 'العملاء',
    icon: Briefcase,
    href: '/clients',
    color: 'text-indigo-500',
  },
  {
    label: 'أعضاء الفريق',
    icon: Users,
    href: '/team',
    color: 'text-violet-500',
    roles: ['admin', 'manager'],
  },
  {
    label: 'التقارير',
    icon: FileBarChart,
    href: '/reports',
    color: 'text-blue-600',
    roles: ['admin', 'manager'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser } = useStore();

  const filteredRoutes = routes.filter(
    (route) => !route.roles || route.roles.includes(currentUser?.role || '')
  );

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/login');
  };

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#0B132B] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4 bg-blue-600 rounded-lg flex items-center justify-center">
            <FolderKanban className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200 font-cairo">
            ProjectFlow
          </h1>
        </Link>
        <div className="space-y-1 font-cairo">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200',
                pathname === route.href || pathname.startsWith(route.href + '/')
                  ? 'text-white bg-blue-600/20 border-r-4 border-blue-500'
                  : 'text-zinc-400'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 ml-3', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 font-cairo">
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-red-500/20 group">
          <LogOut className="h-5 w-5 ml-3 group-hover:text-red-500" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger render={
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      } />
      <SheetContent side="right" className="p-0 bg-[#0B132B] border-none text-white w-72">
        <VisuallyHidden.Root><SheetTitle>القائمة الجانبية</SheetTitle><SheetDescription>تنقل في صفحات التطبيق</SheetDescription></VisuallyHidden.Root>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
