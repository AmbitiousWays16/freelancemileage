import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPen } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface ProfileEditDialogProps {
  profile: Profile | null;
  onSave: (updates: Partial<Profile>) => Promise<boolean>;
}

export const ProfileEditDialog = ({ profile, onSave }: ProfileEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile && open) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setBusinessAddress(profile.business_address || '');
      setBusinessType(profile.business_type || '');
    }
  }, [profile, open]);

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      business_address: businessAddress.trim(),
      business_type: businessType.trim(),
    });
    setSaving(false);
    if (success) {
      toast.success('Profile updated');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Edit Profile">
          <UserPen className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Input id="businessAddress" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Input id="businessType" value={businessType} onChange={e => setBusinessType(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
