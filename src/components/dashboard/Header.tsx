'use client';

import { useStore } from '@/lib/store';
import { MobileSidebar } from './Sidebar';
import { Bell, Search, User as UserIcon } from 'lucide-react';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function Header() {
  const { currentUser, setCurrentUser } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/login');
  };

  return (
    <header className="h-20 flex items-center px-6 border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center gap-4">
          <MobileSidebar />
          <div className="hidden md:flex relative w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="البحث السريع..."
              className="pl-4 pr-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 rounded-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end text-sm">
                  <span className="font-semibold text-slate-800">{currentUser?.full_name}</span>
                  <span className="text-xs text-slate-500">{currentUser?.job_title}</span>
                </div>
                <Avatar className="h-10 w-10 border-2 border-blue-100">
                  <AvatarImage src={currentUser?.avatar_url} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {currentUser?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 font-cairo">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="h-4 w-4 ml-2" />
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
