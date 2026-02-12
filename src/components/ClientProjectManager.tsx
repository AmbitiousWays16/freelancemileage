import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Client, Project } from '@/hooks/useClients';

interface ClientProjectManagerProps {
  clients: Client[];
  projects: Project[];
  loading: boolean;
  onAddClient: (name: string, address: string) => Promise<Client | null>;
  onUpdateClient: (id: string, updates: Partial<Pick<Client, 'name' | 'address'>>) => Promise<boolean>;
  onDeleteClient: (id: string) => Promise<boolean>;
  onAddProject: (clientId: string, name: string, address: string) => Promise<Project | null>;
  onUpdateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'address'>>) => Promise<boolean>;
  onDeleteProject: (id: string) => Promise<boolean>;
  getClientProjects: (clientId: string) => Project[];
}

export const ClientProjectManager = ({
  clients, projects, loading,
  onAddClient, onUpdateClient, onDeleteClient,
  onAddProject, onUpdateProject, onDeleteProject,
  getClientProjects,
}: ClientProjectManagerProps) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'clients' | 'projects'>('clients');

  // Client form
  const [newClientName, setNewClientName] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientAddress, setEditClientAddress] = useState('');

  // Project form
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAddress, setNewProjectAddress] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectAddress, setEditProjectAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddClient = async () => {
    if (!newClientName.trim()) return;
    setIsSubmitting(true);
    const result = await onAddClient(newClientName, newClientAddress);
    if (result) { setNewClientName(''); setNewClientAddress(''); }
    setIsSubmitting(false);
  };

  const handleSaveEditClient = async () => {
    if (!editingClientId || !editClientName.trim()) return;
    setIsSubmitting(true);
    const success = await onUpdateClient(editingClientId, { name: editClientName, address: editClientAddress });
    if (success) setEditingClientId(null);
    setIsSubmitting(false);
  };

  const handleAddProject = async () => {
    if (!selectedClientId || !newProjectName.trim()) return;
    setIsSubmitting(true);
    const result = await onAddProject(selectedClientId, newProjectName, newProjectAddress);
    if (result) { setNewProjectName(''); setNewProjectAddress(''); }
    setIsSubmitting(false);
  };

  const handleSaveEditProject = async () => {
    if (!editingProjectId || !editProjectName.trim()) return;
    setIsSubmitting(true);
    const success = await onUpdateProject(editingProjectId, { name: editProjectName, address: editProjectAddress });
    if (success) setEditingProjectId(null);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Clients & Projects</DialogTitle>
          <DialogDescription>
            Add clients and organize projects under each client.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b pb-2">
          <Button variant={tab === 'clients' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('clients')}>Clients</Button>
          <Button variant={tab === 'projects' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('projects')}>Projects</Button>
        </div>

        {tab === 'clients' && (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <h4 className="text-sm font-medium">Add New Client</h4>
              <div>
                <Label className="text-xs">Name</Label>
                <Input placeholder="e.g., Acme Corp" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Default Address (optional)</Label>
                <Input placeholder="e.g., 123 Main St" value={newClientAddress} onChange={e => setNewClientAddress(e.target.value)} className="mt-1" />
              </div>
              <Button onClick={handleAddClient} disabled={!newClientName.trim() || isSubmitting} size="sm" className="w-full">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Client
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Clients</h4>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : clients.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No clients yet</p>
              ) : clients.map(client => (
                <div key={client.id} className="rounded-lg border bg-background p-3">
                  {editingClientId === client.id ? (
                    <div className="space-y-3">
                      <div><Label className="text-xs">Name</Label><Input value={editClientName} onChange={e => setEditClientName(e.target.value)} className="mt-1" /></div>
                      <div><Label className="text-xs">Address</Label><Input value={editClientAddress} onChange={e => setEditClientAddress(e.target.value)} className="mt-1" /></div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEditClient} disabled={!editClientName.trim() || isSubmitting}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingClientId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{client.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{client.address || 'No address'}</p>
                        <p className="text-xs text-muted-foreground">{getClientProjects(client.id).length} project(s)</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingClientId(client.id); setEditClientName(client.name); setEditClientAddress(client.address); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDeleteClient(client.id)} disabled={isSubmitting}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'projects' && (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <h4 className="text-sm font-medium">Add New Project</h4>
              <div>
                <Label className="text-xs">Client</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Project Name</Label>
                <Input placeholder="e.g., Q1 Maintenance" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Project Address (optional)</Label>
                <Input placeholder="e.g., 456 Work Site Dr" value={newProjectAddress} onChange={e => setNewProjectAddress(e.target.value)} className="mt-1" />
              </div>
              <Button onClick={handleAddProject} disabled={!selectedClientId || !newProjectName.trim() || isSubmitting} size="sm" className="w-full">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Project
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Projects</h4>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : projects.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No projects yet — add a client first</p>
              ) : clients.map(client => {
                const clientProjects = getClientProjects(client.id);
                if (clientProjects.length === 0) return null;
                return (
                  <div key={client.id} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">{client.name}</p>
                    {clientProjects.map(project => (
                      <div key={project.id} className="rounded-lg border bg-background p-3">
                        {editingProjectId === project.id ? (
                          <div className="space-y-3">
                            <div><Label className="text-xs">Name</Label><Input value={editProjectName} onChange={e => setEditProjectName(e.target.value)} className="mt-1" /></div>
                            <div><Label className="text-xs">Address</Label><Input value={editProjectAddress} onChange={e => setEditProjectAddress(e.target.value)} className="mt-1" /></div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveEditProject} disabled={!editProjectName.trim() || isSubmitting}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingProjectId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">{project.name}</p>
                              <p className="truncate text-sm text-muted-foreground">{project.address || 'No address'}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingProjectId(project.id); setEditProjectName(project.name); setEditProjectAddress(project.address); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDeleteProject(project.id)} disabled={isSubmitting}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
