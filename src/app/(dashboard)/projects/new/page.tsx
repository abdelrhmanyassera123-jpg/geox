'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, Project, ProjectStatus } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function NewProjectPage() {
  const router = useRouter();
  const { clients, users, addProject } = useStore();

  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    client_id: '',
    start_date: '',
    end_date: '',
    gdrive_link: '',
    notes: '',
    status: 'not_started',
    pricing_type: 'fixed',
    fixed_price: 0,
    member_ids: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.client_id) {
      toast.error('يرجى ملء الحقول المطلوبة (الاسم، العميل)');
      return;
    }

    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      name: formData.name!,
      description: formData.description || '',
      client_id: formData.client_id!,
      start_date: formData.start_date || '',
      end_date: formData.end_date || '',
      gdrive_link: formData.gdrive_link || '',
      notes: formData.notes || '',
      status: (formData.status as ProjectStatus) || 'not_started',
      pricing_type: formData.pricing_type as 'fixed' | 'task_based',
      fixed_price: formData.pricing_type === 'fixed' ? Number(formData.fixed_price) : 0,
      member_ids: formData.member_ids || [],
    };

    addProject(newProject);
    toast.success('تمت إضافة المشروع بنجاح');
    router.push('/projects');
  };

  const toggleMember = (memberId: string) => {
    setFormData(prev => {
      const current = prev.member_ids || [];
      if (current.includes(memberId)) {
        return { ...prev, member_ids: current.filter(id => id !== memberId) };
      } else {
        return { ...prev, member_ids: [...current, memberId] };
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">مشروع جديد</h2>
        <p className="text-muted-foreground mt-2">إدخال بيانات وتفاصيل المشروع الجديد.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">البيانات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المشروع <span className="text-red-500">*</span></Label>
                <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_id">العميل <span className="text-red-500">*</span></Label>
                <Select value={formData.client_id} onValueChange={(val) => setFormData({...formData, client_id: val || undefined})}>
                  <SelectTrigger dir="rtl"><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                  <SelectContent dir="rtl">
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">وصف المشروع</Label>
              <Textarea id="description" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">تاريخ البدء</Label>
                <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">تاريخ التسليم</Label>
                <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gdrive">رابط المرفقات (Google Drive)</Label>
              <Input id="gdrive" type="url" dir="ltr" className="text-left" value={formData.gdrive_link} onChange={(e) => setFormData({...formData, gdrive_link: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>حالة المشروع</Label>
              <Select value={formData.status} onValueChange={(val: any) => setFormData({...formData, status: val})}>
                <SelectTrigger dir="rtl"><SelectValue /></SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="not_started">لم يبدأ</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="under_review">تحت المراجعة</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea id="notes" rows={2} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">التسعير</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>نوع التسعير</Label>
              <Select value={formData.pricing_type} onValueChange={(val: any) => setFormData({...formData, pricing_type: val, fixed_price: val === 'task_based' ? 0 : formData.fixed_price})}>
                <SelectTrigger dir="rtl"><SelectValue /></SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="fixed">سعر ثابت للمشروع</SelectItem>
                  <SelectItem value="task_based">مبني على المهام (يتم حسابه تلقائياً)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.pricing_type === 'fixed' && (
              <div className="space-y-2 max-w-md">
                <Label htmlFor="price">تكلفة المشروع (ر.س)</Label>
                <Input id="price" type="number" min="0" value={formData.fixed_price} onChange={(e) => setFormData({...formData, fixed_price: Number(e.target.value)})} />
              </div>
            )}
            {formData.pricing_type === 'task_based' && (
              <div className="p-4 bg-sky-50 text-sky-800 rounded-lg text-sm">
                سيتم حساب التكلفة الإجمالية للمشروع تلقائياً بناءً على تكلفة المهام التي سيتم إضافتها لاحقاً داخل صفحة المشروع.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">توزيع الفريق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {users.map(user => (
                <div key={user.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.member_ids?.includes(user.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`} onClick={() => toggleMember(user.id)}>
                  <Checkbox checked={formData.member_ids?.includes(user.id)} onCheckedChange={() => toggleMember(user.id)} />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.full_name}</span>
                    <span className="text-xs text-slate-500">{user.job_title}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>إلغاء</Button>
          <Button type="submit" className="bg-sky-600 hover:bg-sky-700 px-8">حفظ المشروع</Button>
        </div>
      </form>
    </div>
  );
}
