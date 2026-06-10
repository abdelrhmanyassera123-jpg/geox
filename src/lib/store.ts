import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSupabaseConfigured, supabase } from './supabase';

export type Role = 'admin' | 'manager' | 'member';
export type ProjectStatus = 'not_started' | 'in_progress' | 'under_review' | 'completed' | 'cancelled';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  job_title?: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'inactive';
  password?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  notes: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description: string;
  price: number;
  assignee_id?: string;
  start_date: string;
  end_date: string;
  status: TaskStatus;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client_id: string;
  start_date: string;
  end_date: string;
  gdrive_link: string;
  notes: string;
  status: ProjectStatus;
  pricing_type: 'fixed' | 'task_based';
  fixed_price: number;
  member_ids: string[];
}

interface AppState {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

const mockUsers: User[] = [
  { id: '1', full_name: 'المدير العام', email: 'admin@geox.com', password: 'admin', role: 'admin', job_title: 'المدير التنفيذي', phone: '', status: 'active', avatar_url: 'https://i.pravatar.cc/150?u=1' },
];

const mockClients: Client[] = [
  { id: '1', name: 'شركة التقنية الحديثة', phone: '0551234567', email: 'info@techmodern.com', company: 'التقنية الحديثة', notes: 'عميل مميز' },
  { id: '2', name: 'مؤسسة الابتكار', phone: '0551234568', email: 'contact@ibtikar.com', company: 'الابتكار', notes: '' },
];

const mockProjects: Project[] = [
  { id: '1', name: 'تطبيق جوال للتجارة الإلكترونية', description: 'تطبيق متكامل لبيع المنتجات', client_id: '1', start_date: '2026-06-01', end_date: '2026-08-01', gdrive_link: 'https://drive.google.com/...', notes: '', status: 'in_progress', pricing_type: 'fixed', fixed_price: 15000, member_ids: ['2', '3'] },
  { id: '2', name: 'نظام إدارة الموارد', description: 'نظام داخلي للشركة', client_id: '2', start_date: '2026-05-01', end_date: '2026-06-15', gdrive_link: '', notes: '', status: 'under_review', pricing_type: 'task_based', fixed_price: 0, member_ids: ['2'] },
];

const mockTasks: Task[] = [
  { id: '1', project_id: '1', name: 'تصميم واجهات المستخدم', description: 'تصميم 15 شاشة', price: 2000, assignee_id: '3', start_date: '2026-06-01', end_date: '2026-06-10', status: 'completed' },
  { id: '2', project_id: '1', name: 'برمجة الواجهات', description: 'برمجة الشاشات باستخدام React Native', price: 5000, assignee_id: '3', start_date: '2026-06-11', end_date: '2026-07-01', status: 'in_progress' },
  { id: '3', project_id: '2', name: 'تحليل المتطلبات', description: 'كتابة ملف المتطلبات', price: 1000, assignee_id: '2', start_date: '2026-05-01', end_date: '2026-05-05', status: 'completed' },
  { id: '4', project_id: '2', name: 'تصميم قاعدة البيانات', description: '', price: 1500, assignee_id: '2', start_date: '2026-05-06', end_date: '2026-05-10', status: 'completed' },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      users: mockUsers,
      clients: mockClients,
      projects: mockProjects,
      tasks: mockTasks,
      setCurrentUser: (user) => set({ currentUser: user }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, user) => set((state) => ({ users: state.users.map((u) => u.id === id ? { ...u, ...user } : u) })),
      deleteUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
      addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
      updateClient: (id, client) => set((state) => ({ clients: state.clients.map((c) => c.id === id ? { ...c, ...client } : c) })),
      deleteClient: (id) => set((state) => ({ clients: state.clients.filter((c) => c.id !== id) })),
      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, project) => set((state) => ({ projects: state.projects.map((p) => p.id === id ? { ...p, ...project } : p) })),
      deleteProject: (id) => set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, task) => set((state) => ({ tasks: state.tasks.map((t) => t.id === id ? { ...t, ...task } : t) })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
    }),
    {
      name: 'projectflow-storage',
    }
  )
);
