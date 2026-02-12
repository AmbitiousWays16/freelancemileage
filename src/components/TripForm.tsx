import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MapPin, Calendar, Car, FileText, Loader2, RotateCcw, Home } from 'lucide-react';
import { Trip, RouteMapData } from '@/types/mileage';
import { Client, Project } from '@/hooks/useClients';
import { ClientProjectManager } from './ClientProjectManager';
import { AddressAutocomplete } from './AddressAutocomplete';
import { ProxyMapImage } from './ProxyMapImage';
import { z } from 'zod';
import { toast } from 'sonner';

const tripFormSchema = z.object({
  date: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date <= today;
  }, 'Date cannot be in the future'),
  fromAddress: z.string().trim().min(1, 'From address is required').max(500),
  toAddress: z.string().trim().min(1, 'To address is required').max(500),
  businessPurpose: z.string().trim().min(1, 'Business purpose is required').max(500),
  clientName: z.string().min(1, 'Client is required'),
});

interface TripFormProps {
  onSubmit: (trip: Omit<Trip, 'id' | 'createdAt'>) => void;
  onCalculateRoute: (from: string, to: string) => Promise<{ miles: number; routeUrl: string; routeMapData?: RouteMapData } | null>;
  clients: Client[];
  projects: Project[];
  homeAddress: string;
  clientsLoading: boolean;
  onAddClient: (name: string, address: string) => Promise<Client | null>;
  onUpdateClient: (id: string, updates: Partial<Pick<Client, 'name' | 'address'>>) => Promise<boolean>;
  onDeleteClient: (id: string) => Promise<boolean>;
  onAddProject: (clientId: string, name: string, address: string) => Promise<Project | null>;
  onUpdateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'address'>>) => Promise<boolean>;
  onDeleteProject: (id: string) => Promise<boolean>;
  getClientProjects: (clientId: string) => Project[];
}

export const TripForm = ({
  onSubmit, onCalculateRoute,
  clients, projects, homeAddress, clientsLoading,
  onAddClient, onUpdateClient, onDeleteClient,
  onAddProject, onUpdateProject, onDeleteProject,
  getClientProjects,
}: TripFormProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [businessPurpose, setBusinessPurpose] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [miles, setMiles] = useState<number>(0);
  const [routeUrl, setRouteUrl] = useState('');
  const [routeMapData, setRouteMapData] = useState<RouteMapData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientProjects = selectedClientId ? getClientProjects(selectedClientId) : [];
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedProjectId('');
    const client = clients.find(c => c.id === clientId);
    if (client?.address) setToAddress(client.address);
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = projects.find(p => p.id === projectId);
    if (project?.address) setToAddress(project.address);
  };

  const handleCalculateRoute = async () => {
    if (!fromAddress || !toAddress) return;
    setIsCalculating(true);
    try {
      const result = await onCalculateRoute(fromAddress, toAddress);
      if (result) { setMiles(result.miles); setRouteUrl(result.routeUrl); setRouteMapData(result.routeMapData || null); }
    } finally { setIsCalculating(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientName = selectedClient?.name || '';
    const projectName = selectedProject?.name || '';

    const validation = tripFormSchema.safeParse({ date, fromAddress, toAddress, businessPurpose, clientName });
    if (!validation.success) { toast.error(validation.error.errors[0].message); return; }
    if (miles <= 0) { toast.error('Please calculate the route first'); return; }

    const tripData = {
      date: validation.data.date, fromAddress: validation.data.fromAddress, toAddress: validation.data.toAddress,
      businessPurpose: validation.data.businessPurpose, clientName, projectName, program: clientName,
      miles, routeUrl, routeMapData: routeMapData || undefined,
    };

    onSubmit(tripData);
    if (isRoundTrip) {
      onSubmit({
        ...tripData,
        fromAddress: validation.data.toAddress, toAddress: validation.data.fromAddress,
        businessPurpose: `${validation.data.businessPurpose} (Return)`,
      });
    }

    setFromAddress(''); setToAddress(''); setBusinessPurpose('');
    setSelectedClientId(''); setSelectedProjectId('');
    setMiles(0); setRouteUrl(''); setRouteMapData(null); setIsRoundTrip(false);
  };

  const isValid = date && fromAddress && toAddress && businessPurpose && selectedClientId && miles > 0;

  // Build address suggestions from clients + projects
  const addressSuggestions = [
    ...clients.filter(c => c.address).map(c => ({ id: c.id, name: c.name, address: c.address })),
    ...projects.filter(p => p.address).map(p => ({ id: p.id, name: p.name, address: p.address })),
  ];

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <span className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Add New Trip
          </span>
          <ClientProjectManager
            clients={clients} projects={projects} loading={clientsLoading}
            onAddClient={onAddClient} onUpdateClient={onUpdateClient} onDeleteClient={onDeleteClient}
            onAddProject={onAddProject} onUpdateProject={onUpdateProject} onDeleteProject={onDeleteProject}
            getClientProjects={getClientProjects}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-1.5 text-sm font-medium">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Date
              </Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Client
              </Label>
              <Select value={selectedClientId} onValueChange={handleClientChange}>
                <SelectTrigger className="h-10"><SelectValue placeholder={clientsLoading ? 'Loading...' : 'Select client'} /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedClientId && clientProjects.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Project (optional)</Label>
              <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {clientProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from" className="flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="h-3.5 w-3.5 text-success" /> From Address
              </Label>
              <AddressAutocomplete id="from" placeholder="Enter starting address" value={fromAddress} onChange={setFromAddress} suggestions={addressSuggestions} />
              {homeAddress && (
                <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => setFromAddress(homeAddress)}>
                  <Home className="mr-1.5 h-3.5 w-3.5" /> Use Home
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="to" className="flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="h-3.5 w-3.5 text-destructive" /> To Address
              </Label>
              <Input id="to" placeholder="Enter destination" value={toAddress} onChange={e => setToAddress(e.target.value)} className="h-10" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleCalculateRoute} disabled={!fromAddress || !toAddress || isCalculating} className="flex-shrink-0">
              {isCalculating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Calculating...</> : 'Calculate Route'}
            </Button>
            {miles > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2 text-success">
                <Car className="h-4 w-4" /><span className="font-semibold">{miles.toFixed(1)} miles</span>
              </div>
            )}
          </div>

          {routeMapData && (
            <div className="overflow-hidden rounded-lg border">
              <ProxyMapImage routeMapData={routeMapData} routeUrl={routeUrl} className="rounded-t-lg" />
              <div className="bg-muted p-2 text-center text-sm text-muted-foreground">Click to view directions on Google Maps</div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-sm font-medium">Business Purpose</Label>
            <Input id="purpose" placeholder="Describe the business purpose" value={businessPurpose} onChange={e => setBusinessPurpose(e.target.value)} className="h-10" />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="round-trip" className="text-sm font-medium cursor-pointer">Round Trip</Label>
                <p className="text-xs text-muted-foreground">Automatically add return journey</p>
              </div>
            </div>
            <Switch id="round-trip" checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
          </div>

          <Button type="submit" disabled={!isValid} className="w-full gradient-primary">Add Trip</Button>
        </form>
      </CardContent>
    </Card>
  );
};
