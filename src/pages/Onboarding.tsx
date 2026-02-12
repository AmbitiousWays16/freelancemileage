import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

const Onboarding = () => {
  const navigate = useNavigate();
  const { saveProfile } = useProfile();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }
    setIsSubmitting(true);
    const success = await saveProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      home_address: homeAddress.trim(),
      business_address: businessAddress.trim(),
      business_type: businessType.trim(),
      profile_completed: true,
    });
    setIsSubmitting(false);
    if (success) {
      toast.success('Profile completed!');
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Tell us about yourself to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name *</Label>
              <Input
                id="first-name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name *</Label>
              <Input
                id="last-name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="home-address" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Home Address
            </Label>
            <Input
              id="home-address"
              placeholder="123 Main St, City, State ZIP"
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Used as default starting point for trips</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-address" className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Business Address
            </Label>
            <Input
              id="business-address"
              placeholder="456 Business Ave, City, State ZIP"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Optional — shown on invoices</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-type">Business Type</Label>
            <Input
              id="business-type"
              placeholder="e.g. IT Consulting, Plumbing, Real Estate"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue to Mileage Tracker
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
