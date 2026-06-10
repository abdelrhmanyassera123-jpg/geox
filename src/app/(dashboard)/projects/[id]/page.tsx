'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, Task, TaskStatus } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Building2, Calendar, FileText, Link as LinkIcon, Phone, Plus, User, Edit2, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  not_started: 'لم يبدأ',
  in_progress: 'قيد التنفيذ',
  under_review: 'تحت المراجعة',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { projects, clients, users, tasks, addTask, updateTask, deleteTask, currentUser } = useStore();
  
  const project = projects.find(p => p.id === resolvedParams.id);
  const client = clients.find(c => c.id === project?.client_id);
  const projectTasks = tasks.filter(t => t.project_id === resolvedParams.id);
  
  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    name: '', description: '', price: 0, assignee_id: '', start_date: '', end_date: '', status: 'not_started'
  });

  if (!project) return <div className="text-center py-20 text-xl font-semibold">المشروع غير موجود</div>;

  const progress = projectTasks.length === 0 ? 0 : 
    Math.round((projectTasks.filter(t => t.status === 'completed').length / projectTasks.length) * 100);

  const totalCost = project.pricing_type === 'fixed' ? project.fixed_price : projectTasks.reduce((acc, t) => acc + t.price, 0);

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.name) {
      toast.error('يرجى إدخال اسم المهمة');
      return;
    }
    if (editingTask) {
      updateTask(editingTask.id, taskForm);
      toast.success('تم تحديث المهمة بنجاح');
    } else {
      addTask({
        ...(taskForm as Task),
        project_id: project.id,
        id: Math.random().toString(36).substring(7),
      });
      toast.success('تم إضافة المهمة بنجاح');
    }
    setIsTaskDialogOpen(false);
    setEditingTask(null);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm(task);
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('هل أنت متأكد من حذف المهمة؟')) {
      deleteTask(id);
      toast.success('تم الحذف');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{project.name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" className={statusColors[project.status]}>
              {statusLabels[project.status]}
            </Badge>
            <span className="text-sm text-slate-500">تم الإنشاء: {project.start_date || 'غير محدد'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex justify-between">
                <span>المهام ({projectTasks.length})</span>
                {isAdminOrManager && (
                  <Dialog open={isTaskDialogOpen} onOpenChange={(open) => { setIsTaskDialogOpen(open); if(!open) setEditingTask(null); }}>
                    <DialogTrigger render={
                      <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white" onClick={() => setTaskForm({name: '', description: '', price: 0, assignee_id: '', start_date: '', end_date: '', status: 'not_started'})}>
                        <Plus className="ml-1 h-4 w-4" /> إضافة مهمة
                      </Button>
                    } />
                    <DialogContent className="sm:max-w-[450px] font-cairo" dir="rtl">
                      <DialogHeader>
                        <DialogTitle>{editingTask ? 'تعديل مهمة' : 'مهمة جديدة'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleTaskSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>اسم المهمة</Label>
                          <Input required value={taskForm.name} onChange={(e) => setTaskForm({...taskForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>الوصف</Label>
                          <Textarea rows={2} value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} />
                        </div>
                        {project.pricing_type === 'task_based' && (
                          <div className="space-y-2">
                            <Label>السعر (ر.س)</Label>
                            <Input type="number" min="0" value={taskForm.price} onChange={(e) => setTaskForm({...taskForm, price: Number(e.target.value)})} />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>المسؤول</Label>
                            <Select value={taskForm.assignee_id} onValueChange={(val) => setTaskForm({...taskForm, assignee_id: val || undefined})}>
                              <SelectTrigger dir="rtl"><SelectValue placeholder="اختر العضو" /></SelectTrigger>
                              <SelectContent dir="rtl">
                                {project.member_ids.map(id => {
                                  const user = users.find(u => u.id === id);
                                  return user ? <SelectItem key={id} value={id}>{user.full_name}</SelectItem> : null;
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>الحالة</Label>
                            <Select value={taskForm.status} onValueChange={(val: any) => setTaskForm({...taskForm, status: val})}>
                              <SelectTrigger dir="rtl"><SelectValue /></SelectTrigger>
                              <SelectContent dir="rtl">
                                <SelectItem value="not_started">لم تبدأ</SelectItem>
                                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                                <SelectItem value="completed">مكتملة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>تاريخ البدء</Label>
                            <Input type="date" value={taskForm.start_date} onChange={(e) => setTaskForm({...taskForm, start_date: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>تاريخ الانتهاء</Label>
                            <Input type="date" value={taskForm.end_date} onChange={(e) => setTaskForm({...taskForm, end_date: e.target.value})} />
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700">حفظ المهمة</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">نسبة إنجاز المشروع</span>
                    <span className="font-bold text-sky-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2.5 bg-slate-100 [&>div]:bg-sky-500" />
                  <div className="text-xs text-slate-500 mt-2">
                    تم إنجاز {projectTasks.filter(t => t.status === 'completed').length} من أصل {projectTasks.length} مهام
                  </div>
                </div>

                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-right">المهمة</TableHead>
                        <TableHead className="text-right">المسؤول</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        {project.pricing_type === 'task_based' && <TableHead className="text-right">السعر</TableHead>}
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectTasks.map(task => {
                        const assignee = users.find(u => u.id === task.assignee_id);
                        const canEdit = isAdminOrManager || currentUser?.id === task.assignee_id;
                        return (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div className="font-medium text-slate-900">{task.name}</div>
                              <div className="text-xs text-slate-500">{task.start_date} - {task.end_date}</div>
                            </TableCell>
                            <TableCell>
                              {assignee ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6"><AvatarImage src={assignee.avatar_url} /><AvatarFallback>{assignee.full_name.charAt(0)}</AvatarFallback></Avatar>
                                  <span className="text-sm">{assignee.full_name}</span>
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : task.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : ''}>
                                {task.status === 'completed' ? 'مكتملة' : task.status === 'in_progress' ? 'قيد التنفيذ' : 'لم تبدأ'}
                              </Badge>
                            </TableCell>
                            {project.pricing_type === 'task_based' && <TableCell>{task.price} ر.س</TableCell>}
                            <TableCell>
                              {canEdit && (
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => openEditTask(task)}><Edit2 className="h-3.5 w-3.5 text-blue-600" /></Button>
                                  {isAdminOrManager && <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}><Trash2 className="h-3.5 w-3.5 text-red-600" /></Button>}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {projectTasks.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center py-6 text-slate-500">لا توجد مهام</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">تفاصيل العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{client.name}</div>
                      <div className="text-sm text-slate-500">{client.company || 'لا توجد شركة'}</div>
                    </div>
                  </div>
                  <div className="pt-2 space-y-3">
                    {client.phone && <div className="flex items-center gap-3 text-sm text-slate-600"><Phone className="h-4 w-4 text-slate-400" /><span dir="ltr">{client.phone}</span></div>}
                    {client.email && <div className="flex items-center gap-3 text-sm text-slate-600"><Mail className="h-4 w-4 text-slate-400" /><span>{client.email}</span></div>}
                  </div>
                </>
              ) : (
                <div className="text-slate-500 text-sm">لم يتم تعيين عميل</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">معلومات مالية وزمنية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">نوع التسعير</span>
                <span className="font-medium">{project.pricing_type === 'fixed' ? 'سعر ثابت' : 'مبني على المهام'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">التكلفة الإجمالية</span>
                <span className="font-bold text-emerald-600">{totalCost.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">تاريخ التسليم</span>
                <span className="font-medium" dir="ltr">{project.end_date || 'غير محدد'}</span>
              </div>
              {project.gdrive_link && (
                <div className="pt-2">
                  <a href={project.gdrive_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                    <LinkIcon className="h-4 w-4" /> روابط المرفقات
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">فريق العمل ({project.member_ids.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.member_ids.map(id => {
                  const user = users.find(u => u.id === id);
                  if (!user) return null;
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{user.full_name}</div>
                        <div className="text-xs text-slate-500">{user.job_title}</div>
                      </div>
                    </div>
                  );
                })}
                {project.member_ids.length === 0 && <div className="text-sm text-slate-500">لم يتم تعيين أعضاء للمشروع</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const Mail = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
)
