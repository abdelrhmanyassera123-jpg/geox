'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const statusColors: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200',
  in_progress: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
  under_review: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
};

const statusLabels: Record<string, string> = {
  not_started: 'لم يبدأ',
  in_progress: 'قيد التنفيذ',
  under_review: 'تحت المراجعة',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export default function ProjectsPage() {
  const { projects, clients, users, tasks, currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  // For members, only show their projects
  const visibleProjects = isAdminOrManager 
    ? projects 
    : projects.filter(p => p.member_ids.includes(currentUser?.id || ''));

  const filteredProjects = visibleProjects.filter(p => 
    p.name.includes(searchTerm) || 
    clients.find(c => c.id === p.client_id)?.name.includes(searchTerm)
  );

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.project_id === projectId);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const getProjectCost = (project: any) => {
    if (project.pricing_type === 'fixed') {
      return project.fixed_price;
    }
    const projectTasks = tasks.filter(t => t.project_id === project.id);
    return projectTasks.reduce((acc, t) => acc + t.price, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">المشاريع</h2>
          <p className="text-muted-foreground mt-2">إدارة ومتابعة جميع المشاريع.</p>
        </div>
        {isAdminOrManager && (
          <Link href="/projects/new">
            <Button className="bg-sky-600 hover:bg-sky-700 text-white">
              <Plus className="ml-2 h-4 w-4" /> إضافة مشروع
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث باسم المشروع أو العميل..." 
              className="pl-4 pr-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="text-slate-600">
            <Filter className="ml-2 h-4 w-4" /> تصفية
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right">اسم المشروع</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                    التكلفة <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-right">تاريخ التسليم</TableHead>
                <TableHead className="text-right w-[150px]">نسبة الإنجاز</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الفريق</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const client = clients.find(c => c.id === project.client_id);
                const progress = getProjectProgress(project.id);
                const cost = getProjectCost(project);
                
                return (
                  <TableRow key={project.id} className="cursor-pointer hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <Link href={`/projects/${project.id}`} className="font-semibold text-sky-700 hover:underline block">
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-600">{client?.name || '-'}</TableCell>
                    <TableCell className="font-medium text-slate-700">{cost.toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-slate-600" dir="ltr">{project.end_date}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[project.status]}>
                        {statusLabels[project.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2 space-x-reverse">
                        {project.member_ids.slice(0, 3).map(memberId => {
                          const member = users.find(u => u.id === memberId);
                          if (!member) return null;
                          return (
                            <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback className="text-xs">{member.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          );
                        })}
                        {project.member_ids.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600 z-10">
                            +{project.member_ids.length - 3}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    لا توجد مشاريع لعرضها
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
