'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { users, setCurrentUser } = useStore();
  const [email, setEmail] = useState('admin@geox.com');
  const [password, setPassword] = useState('admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth logic
    const user = users.find(u => u.email === email);
    if (user && user.password === password) {
      if (user.status !== 'active') {
        toast.error('هذا الحساب غير نشط');
        return;
      }
      setCurrentUser(user);
      toast.success('تم تسجيل الدخول بنجاح');
      router.push('/dashboard');
    } else {
      toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-3 text-center items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md mb-2">
            <FolderKanban className="text-white h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">ProjectFlow</CardTitle>
          <CardDescription>تسجيل الدخول إلى لوحة التحكم</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="email" 
                dir="ltr"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input 
                id="password" 
                type="password" 
                dir="ltr"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
              دخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
