import { Car, LogOut, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ExportButton } from './ExportButton';
import { InvoiceExport } from './InvoiceExport';
import { HomeAddressSettings } from './HomeAddressSettings';
import { CompanyBrandingUpload } from './CompanyBrandingUpload';
import { Trip } from '@/types/mileage';
import { Profile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HeaderProps {
  trips: Trip[];
  totalMiles: number;
  homeAddress: string;
  onSaveHomeAddress: (address: string) => Promise<void>;
  profile: Profile | null;
  onUploadBranding?: (file: File, type: 'logo' | 'banner') => Promise<string | null>;
  onRemoveBranding?: (type: 'logo' | 'banner') => Promise<void>;
}

export const Header = ({ trips, totalMiles, homeAddress, onSaveHomeAddress, profile, onUploadBranding, onRemoveBranding }: HeaderProps) => {
  const { signOut, user, isPremium } = useAuth();
  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : user?.email;

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      toast.error('Could not open subscription management.');
    }
  };

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      toast.error('Could not start checkout.');
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Mileage Tracker</h1>
                {isPremium && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Crown className="h-3 w-3" /> Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{displayName}</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isPremium ? (
            <>
              <InvoiceExport trips={trips} profile={profile} />
              {onUploadBranding && onRemoveBranding && (
                <CompanyBrandingUpload profile={profile} onUpload={onUploadBranding} onRemove={onRemoveBranding} />
              )}
              <Button variant="ghost" size="sm" onClick={handleManageSubscription}>
                Manage Plan
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleUpgrade} className="gap-1">
              <Crown className="h-3.5 w-3.5" /> Upgrade
            </Button>
          )}
          <ExportButton trips={trips} totalMiles={totalMiles} />
          <HomeAddressSettings homeAddress={homeAddress} onSave={onSaveHomeAddress} />
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
