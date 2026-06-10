'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { projects, tasks, users } = useStore();

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const delayedProjects = projects.filter(p => new Date(p.end_date) < new Date() && p.status !== 'completed').length;

  const totalRevenue = projects.reduce((acc, p) => acc + p.fixed_price, 0) + tasks.reduce((acc, t) => acc + t.price, 0);
  const currentMonthRevenue = totalRevenue * 0.4; // Mock calculation

  const projectStatusData = [
    { name: 'قيد التنفيذ', value: activeProjects },
    { name: 'مكتمل', value: completedProjects },
    { name: 'لم يبدأ', value: projects.filter(p => p.status === 'not_started').length },
    { name: 'تحت المراجعة', value: projects.filter(p => p.status === 'under_review').length },
  ];

  const monthlyRevenueData = [
    { name: 'يناير', total: 12000 },
    { name: 'فبراير', total: 19000 },
    { name: 'مارس', total: 15000 },
    { name: 'أبريل', total: 22000 },
    { name: 'مايو', total: 28000 },
    { name: 'يونيو', total: currentMonthRevenue },
  ];

  const teamProductivityData = users.map(user => ({
    name: user.full_name.split(' ')[0],
    tasksCompleted: tasks.filter(t => t.assignee_id === user.id && t.status === 'completed').length,
    tasksInProgress: tasks.filter(t => t.assignee_id === user.id && t.status === 'in_progress').length,
  }));

  const statsCards = [
    { title: 'إجمالي المشاريع', value: totalProjects, icon: FolderKanban, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'المشاريع النشطة', value: activeProjects, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-100' },
    { title: 'المشاريع المكتملة', value: completedProjects, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { title: 'المشاريع المتأخرة', value: delayedProjects, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' },
    { title: 'إجمالي الأرباح', value: `${totalRevenue.toLocaleString()} ر.س`, icon: DollarSign, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { title: 'أرباح الشهر الحالي', value: `${currentMonthRevenue.toLocaleString()} ر.س`, icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">لوحة التحكم</h2>
        <p className="text-muted-foreground mt-2">نظرة عامة على أداء المشاريع والأعمال.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>الأرباح الشهرية</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>حالة المشاريع</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>إنتاجية الفريق</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={teamProductivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="tasksCompleted" name="مهام مكتملة" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tasksInProgress" name="مهام قيد التنفيذ" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
