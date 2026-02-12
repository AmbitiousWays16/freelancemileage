import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Home, Save } from 'lucide-react';

interface HomeAddressSettingsProps {
  homeAddress: string;
  onSave: (address: string) => Promise<void>;
}

export const HomeAddressSettings = ({ homeAddress, onSave }: HomeAddressSettingsProps) => {
  const [address, setAddress] = useState(homeAddress);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(address);
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setAddress(homeAddress); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Home address settings">
          <Home className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Home Address
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="home-address">Your home/starting address</Label>
            <Input
              id="home-address"
              placeholder="123 Main St, City, State ZIP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This will be available as a quick-fill option for the "From" field when adding trips.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving || !address.trim()} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Home Address
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
