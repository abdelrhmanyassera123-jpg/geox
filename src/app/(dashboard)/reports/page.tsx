'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { projects, clients, users, tasks, currentUser } = useStore();

  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  if (!isAdminOrManager) {
    return <div className="text-center py-20">لا تملك صلاحية الوصول لهذه الصفحة</div>;
  }

  // Helpers for exports
  const exportPDF = (title: string, head: string[][], body: any[][]) => {
    const doc = new jsPDF();
    
    // Add Arabic font (Requires a base64 encoded font in a real app, 
    // for this demo we just rely on standard English chars if Arabic isn't supported, 
    // but typically we'd use amiri or cairo base64).
    // Note: jsPDF default fonts don't support Arabic out of the box without a VFS font. 
    // We will use standard output for demo but inform in UI.

    doc.text(title, 14, 20);
    autoTable(doc, {
      head: head,
      body: body,
      startY: 30,
      styles: { halign: 'right', font: 'helvetica' },
      headStyles: { fillColor: [59, 130, 246] }
    });
    doc.save(`${title}.pdf`);
  };

  const exportExcel = (title: string, data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const reports = [
    {
      title: 'تقرير المشاريع',
      description: 'حالة جميع المشاريع، التكلفة، ونسبة الإنجاز.',
      onExportPDF: () => {
        const head = [['Project Name', 'Client', 'Cost', 'Status']];
        const body = projects.map(p => [p.name, clients.find(c=>c.id===p.client_id)?.name || '', p.fixed_price, p.status]);
        exportPDF('Projects Report', head, body);
      },
      onExportExcel: () => {
        const data = projects.map(p => ({
          'اسم المشروع': p.name,
          'العميل': clients.find(c=>c.id===p.client_id)?.name || '',
          'التكلفة': p.fixed_price,
          'الحالة': p.status
        }));
        exportExcel('Projects Report', data);
      }
    },
    {
      title: 'تقرير الأرباح',
      description: 'تفاصيل الأرباح من جميع المشاريع والمهام.',
      onExportPDF: () => {
        const head = [['Item Name', 'Type', 'Amount']];
        const body = [
          ...projects.map(p => [p.name, 'Project', p.fixed_price]),
          ...tasks.map(t => [t.name, 'Task', t.price])
        ];
        exportPDF('Revenue Report', head, body);
      },
      onExportExcel: () => {
        const data = [
          ...projects.map(p => ({ 'الاسم': p.name, 'النوع': 'مشروع', 'المبلغ': p.fixed_price })),
          ...tasks.map(t => ({ 'الاسم': t.name, 'النوع': 'مهمة', 'المبلغ': t.price }))
        ];
        exportExcel('Revenue Report', data);
      }
    },
    {
      title: 'تقرير العملاء',
      description: 'قائمة بجميع العملاء وبيانات التواصل.',
      onExportPDF: () => {
        const head = [['Name', 'Company', 'Phone', 'Email']];
        const body = clients.map(c => [c.name, c.company, c.phone, c.email]);
        exportPDF('Clients Report', head, body);
      },
      onExportExcel: () => {
        const data = clients.map(c => ({ 'الاسم': c.name, 'الشركة': c.company, 'الهاتف': c.phone, 'البريد': c.email }));
        exportExcel('Clients Report', data);
      }
    },
    {
      title: 'تقرير أداء الفريق',
      description: 'إحصائيات المهام المنجزة لكل عضو.',
      onExportPDF: () => {
        const head = [['Member Name', 'Role', 'Completed Tasks', 'In Progress']];
        const body = users.map(u => [
          u.full_name, 
          u.role, 
          tasks.filter(t => t.assignee_id === u.id && t.status === 'completed').length,
          tasks.filter(t => t.assignee_id === u.id && t.status === 'in_progress').length
        ]);
        exportPDF('Team Performance Report', head, body);
      },
      onExportExcel: () => {
        const data = users.map(u => ({
          'الاسم': u.full_name,
          'المنصب': u.role,
          'مهام مكتملة': tasks.filter(t => t.assignee_id === u.id && t.status === 'completed').length,
          'مهام قيد التنفيذ': tasks.filter(t => t.assignee_id === u.id && t.status === 'in_progress').length
        }));
        exportExcel('Team Performance Report', data);
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">التقارير</h2>
        <p className="text-muted-foreground mt-2">تصدير تقارير وإحصائيات النظام الشاملة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, idx) => (
          <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-blue-700">
                <FileText className="h-5 w-5" /> {report.title}
              </CardTitle>
              <CardDescription className="text-sm mt-1">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mt-4">
                <Button onClick={report.onExportPDF} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                  <Download className="mr-2 h-4 w-4" /> تصدير PDF
                </Button>
                <Button onClick={report.onExportExcel} variant="outline" className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> تصدير Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
