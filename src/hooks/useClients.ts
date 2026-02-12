import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  address: string;
}

export const useClients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user.id).order('name'),
        supabase.from('projects').select('*').eq('user_id', user.id).order('name'),
      ]);
      if (clientsRes.error) throw clientsRes.error;
      if (projectsRes.error) throw projectsRes.error;

      setClients((clientsRes.data || []).map(c => ({
        id: c.id, name: c.name, address: c.address, email: c.email, phone: c.phone,
      })));
      setProjects((projectsRes.data || []).map(p => ({
        id: p.id, client_id: p.client_id, name: p.name, address: p.address,
      })));
    } catch (e) {
      console.error('Error fetching clients/projects:', e);
      toast.error('Failed to load clients/projects');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addClient = useCallback(async (name: string, address = '', email = '', phone = ''): Promise<Client | null> => {
    if (!user) return null;
    const trimmed = name.trim();
    if (!trimmed) { toast.error('Name is required'); return null; }
    if (clients.find(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Client already exists'); return null;
    }
    try {
      const { data, error } = await supabase.from('clients')
        .insert({ user_id: user.id, name: trimmed, address: address.trim(), email: email.trim(), phone: phone.trim() })
        .select().single();
      if (error) throw error;
      const newClient: Client = { id: data.id, name: data.name, address: data.address, email: data.email, phone: data.phone };
      setClients(prev => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Client added');
      return newClient;
    } catch (e) { console.error(e); toast.error('Failed to add client'); return null; }
  }, [user, clients]);

  const updateClient = useCallback(async (id: string, updates: Partial<Pick<Client, 'name' | 'address' | 'email' | 'phone'>>): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('clients').update(updates).eq('id', id);
      if (error) throw error;
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c).sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Client updated');
      return true;
    } catch (e) { console.error(e); toast.error('Failed to update client'); return false; }
  }, [user]);

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      setClients(prev => prev.filter(c => c.id !== id));
      setProjects(prev => prev.filter(p => p.client_id !== id));
      toast.success('Client deleted');
      return true;
    } catch (e) { console.error(e); toast.error('Failed to delete client'); return false; }
  }, [user]);

  const addProject = useCallback(async (clientId: string, name: string, address = ''): Promise<Project | null> => {
    if (!user) return null;
    const trimmed = name.trim();
    if (!trimmed) { toast.error('Project name is required'); return null; }
    try {
      const { data, error } = await supabase.from('projects')
        .insert({ user_id: user.id, client_id: clientId, name: trimmed, address: address.trim() })
        .select().single();
      if (error) throw error;
      const newProject: Project = { id: data.id, client_id: data.client_id, name: data.name, address: data.address };
      setProjects(prev => [...prev, newProject].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Project added');
      return newProject;
    } catch (e) { console.error(e); toast.error('Failed to add project'); return null; }
  }, [user]);

  const updateProject = useCallback(async (id: string, updates: Partial<Pick<Project, 'name' | 'address'>>): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('projects').update(updates).eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p).sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Project updated');
      return true;
    } catch (e) { console.error(e); toast.error('Failed to update project'); return false; }
  }, [user]);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted');
      return true;
    } catch (e) { console.error(e); toast.error('Failed to delete project'); return false; }
  }, [user]);

  const getClientProjects = useCallback((clientId: string) => {
    return projects.filter(p => p.client_id === clientId);
  }, [projects]);

  return {
    clients, projects, loading,
    addClient, updateClient, deleteClient,
    addProject, updateProject, deleteProject,
    getClientProjects, refetch: fetchAll,
  };
};
