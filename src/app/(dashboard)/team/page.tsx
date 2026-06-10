'use client';

import { useState } from 'react';
import { useStore, User, Role } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamPage() {
  const { users, currentUser, addUser, updateUser, deleteUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const [formData, setFormData] = useState<Partial<User>>({
    full_name: '',
    email: '',
    role: 'member',
    job_title: '',
    phone: '',
    status: 'active',
  });

  const filteredUsers = users.filter((user) => 
    user.full_name.includes(searchTerm) || 
    user.email.includes(searchTerm) ||
    (user.job_title && user.job_title.includes(searchTerm))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast.success('تم تحديث بيانات العضو بنجاح');
    } else {
      addUser({
        ...(formData as User),
        id: Math.random().toString(36).substring(7),
        avatar_url: `https://i.pravatar.cc/150?u=${Math.random()}`
      });
      toast.success('تمت إضافة العضو بنجاح');
    }
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العضو؟')) {
      deleteUser(id);
      toast.success('تم حذف العضو بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">أعضاء الفريق</h2>
          <p className="text-muted-foreground mt-2">إدارة فريق العمل والصلاحيات.</p>
        </div>
        {isAdminOrManager && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingUser(null);
          }}>
            <DialogTrigger render={
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setFormData({ full_name: '', email: '', role: 'member', job_title: '', phone: '', status: 'active' })}>
                <Plus className="ml-2 h-4 w-4" /> إضافة عضو
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px] font-cairo" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'تعديل بيانات العضو' : 'إضافة عضو جديد'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">الاسم بالكامل</Label>
                  <Input id="full_name" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">المسمى الوظيفي</Label>
                  <Input id="job_title" value={formData.job_title} onChange={(e) => setFormData({...formData, job_title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الصلاحية</Label>
                    <Select value={formData.role} onValueChange={(val: any) => setFormData({...formData, role: val || 'member'})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">مدير نظام</SelectItem>
                        <SelectItem value="manager">مدير مشاريع</SelectItem>
                        <SelectItem value="member">عضو</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الحالة</Label>
                    <Select value={formData.status} onValueChange={(val: any) => setFormData({...formData, status: val || 'active'})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">حفظ</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="بحث بالاسم أو البريد..." 
            className="pl-4 pr-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right">العضو</TableHead>
                <TableHead className="text-right">التواصل</TableHead>
                <TableHead className="text-right">الصلاحية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                {isAdminOrManager && <TableHead className="text-right">إجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-900">{user.full_name}</div>
                      <div className="text-sm text-slate-500">{user.job_title}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.email}</div>
                    <div className="text-sm text-slate-500" dir="ltr">{user.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-200' :
                      user.role === 'manager' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }>
                      {user.role === 'admin' ? 'مدير نظام' : user.role === 'manager' ? 'مدير مشاريع' : 'عضو'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                      {user.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                  {isAdminOrManager && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
