'use client';

import { useState } from 'react';
import { useStore, Client } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit2, Trash2, Building2, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientsPage() {
  const { clients, currentUser, addClient, updateClient, deleteClient } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: '',
  });

  const filteredClients = clients.filter((client) => 
    client.name.includes(searchTerm) || 
    client.company.includes(searchTerm) ||
    client.email.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient.id, formData);
      toast.success('تم تحديث بيانات العميل بنجاح');
    } else {
      addClient({
        ...(formData as Client),
        id: Math.random().toString(36).substring(7),
      });
      toast.success('تمت إضافة العميل بنجاح');
    }
    setIsDialogOpen(false);
    setEditingClient(null);
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setFormData(client);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteClient(id);
      toast.success('تم حذف العميل بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">العملاء</h2>
          <p className="text-muted-foreground mt-2">إدارة بيانات العملاء والشركات.</p>
        </div>
        {isAdminOrManager && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingClient(null);
          }}>
            <DialogTrigger render={
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setFormData({ name: '', phone: '', email: '', company: '', notes: '' })}>
                <Plus className="ml-2 h-4 w-4" /> إضافة عميل
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px] font-cairo" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingClient ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم العميل</Label>
                  <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">الشركة</Label>
                  <Input id="company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Input id="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">حفظ</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="بحث باسم العميل أو الشركة..." 
            className="pl-4 pr-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right">اسم العميل</TableHead>
                <TableHead className="text-right">الشركة</TableHead>
                <TableHead className="text-right">التواصل</TableHead>
                <TableHead className="text-right">ملاحظات</TableHead>
                {isAdminOrManager && <TableHead className="text-right">إجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-semibold text-slate-900">{client.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-slate-600">
                      <Building2 className="h-4 w-4 ml-2 text-slate-400" />
                      {client.company || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="h-4 w-4 ml-2 text-slate-400" />
                        {client.email || '-'}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="h-4 w-4 ml-2 text-slate-400" />
                        <span dir="ltr">{client.phone || '-'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 max-w-[200px] truncate">{client.notes || '-'}</TableCell>
                  {isAdminOrManager && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(client)}>
                          <Edit2 className="h-4 w-4 text-indigo-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}>
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
