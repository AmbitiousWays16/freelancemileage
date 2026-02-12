import { Header } from '@/components/Header';
import { TripForm } from '@/components/TripForm';
import { TripList } from '@/components/TripList';
import { MileageSummary } from '@/components/MileageSummary';
import { MonthSelector } from '@/components/MonthSelector';
import { ArchivePromptDialog } from '@/components/ArchivePromptDialog';
import { useTrips } from '@/hooks/useTrips';
import { useClients } from '@/hooks/useClients';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const { trips, addTrip, deleteTrip, totalMiles, selectedMonth, changeMonth, isCurrentMonth, refetch } = useTrips();
  const {
    clients, projects, loading: clientsLoading,
    addClient, updateClient, deleteClient,
    addProject, updateProject, deleteProject,
    getClientProjects,
  } = useClients();
  const { profile, saveProfile, uploadBranding } = useProfile();
  const { isPremium } = useAuth();

  const homeAddress = profile?.home_address || '';
  const saveHomeAddress = async (address: string) => { await saveProfile({ home_address: address }); };

  const handleCalculateRoute = async (from: string, to: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) { toast.error('Please log in to calculate routes'); return null; }

      const { data, error } = await supabase.functions.invoke('google-maps-route', {
        body: { fromAddress: from, toAddress: to },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) { toast.error('Failed to calculate route.'); return null; }
      if (data?.error) { toast.error(data.error); return null; }
      toast.success(`Route calculated: ${data.miles} miles`);
      return { miles: data.miles, routeUrl: data.routeUrl, routeMapData: data.routeMapData };
    } catch {
      toast.error('Failed to calculate route.');
      return null;
    }
  };

  const handleAddTrip = async (tripData: Parameters<typeof addTrip>[0]) => {
    const result = await addTrip(tripData);
    if (result) toast.success('Trip added successfully!');
  };

  const handleDeleteTrip = async (id: string) => {
    await deleteTrip(id);
    toast.success('Trip deleted');
  };

  return (
    <div className="min-h-screen bg-background">
      {isPremium && <ArchivePromptDialog onExportComplete={refetch} />}
      <Header
        trips={trips}
        totalMiles={totalMiles}
        homeAddress={homeAddress}
        onSaveHomeAddress={saveHomeAddress}
        profile={profile}
        onUploadBranding={uploadBranding}
        onRemoveBranding={async (type) => {
          await saveProfile({ [type === 'logo' ? 'company_logo_url' : 'company_banner_url']: '' });
        }}
      />

      <main className="container mx-auto space-y-6 px-4 py-6">
        <MonthSelector selectedMonth={selectedMonth} onMonthChange={changeMonth} />
        <MileageSummary trips={trips} totalMiles={totalMiles} />

        <div className="grid gap-6 lg:grid-cols-2">
          {isCurrentMonth && (
            <TripForm
              onSubmit={handleAddTrip}
              onCalculateRoute={handleCalculateRoute}
              clients={clients}
              projects={projects}
              homeAddress={homeAddress}
              clientsLoading={clientsLoading}
              onAddClient={addClient}
              onUpdateClient={updateClient}
              onDeleteClient={deleteClient}
              onAddProject={addProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              getClientProjects={getClientProjects}
            />
          )}
          <TripList
            trips={trips}
            onDelete={handleDeleteTrip}
            totalMiles={totalMiles}
            isArchiveView={!isCurrentMonth}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
