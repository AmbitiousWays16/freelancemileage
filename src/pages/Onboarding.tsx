import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, MapPin, Briefcase, Check, Crown, Sparkles, Archive, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const FREE_FEATURES = [
  'Log unlimited trips',
  'Basic mileage tracking',
  'Monthly PDF export',
];

const PREMIUM_FEATURES = [
  'Everything in Free',
  'AI suggestions for business purposes',
  'Archive monthly trip logs for taxes',
  'Add client/business details to invoices',
  'Send digital payment requests (Cash App, Venmo, Apple Pay)',
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { saveProfile, profile } = useProfile();
  const { checkSubscription } = useAuth();
  const [step, setStep] = useState<'profile' | 'plan'>(
    profile?.profile_completed ? 'plan' : 'profile'
  );
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleProfileSubmit = async () => {
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
      setStep('plan');
    }
  };

  const handleFreePlan = () => {
    toast.success('Welcome! You\'re on the Free plan.');
    navigate('/', { replace: true });
  };

  const handlePremiumPlan = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        // Poll for subscription after checkout
        const poll = setInterval(async () => {
          await checkSubscription();
        }, 3000);
        setTimeout(() => clearInterval(poll), 120000);
        toast.info('Complete payment in the new tab, then return here.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (step === 'plan') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-3xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
            <p className="text-muted-foreground">Start free or unlock all features with Premium</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Free Plan */}
            <Card className="relative border-2 border-border">
              <CardHeader>
                <CardTitle className="text-xl">Free</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground"> / month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" onClick={handleFreePlan}>
                  Continue Free
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-2 border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gradient-primary text-primary-foreground px-3 py-1">
                  <Crown className="mr-1 h-3 w-3" /> Recommended
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  Premium <Sparkles className="h-4 w-4 text-primary" />
                </CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">$2.99</span>
                  <span className="text-muted-foreground"> / month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {PREMIUM_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" onClick={handlePremiumPlan} disabled={checkoutLoading}>
                  {checkoutLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Get Premium
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            You can upgrade anytime from settings. Cancel anytime.
          </p>
        </div>
      </div>
    );
  }

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
              <Input id="first-name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name *</Label>
              <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="home-address" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Home Address
            </Label>
            <Input id="home-address" placeholder="123 Main St, City, State ZIP" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} />
            <p className="text-xs text-muted-foreground">Used as default starting point for trips</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-address" className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Business Address
            </Label>
            <Input id="business-address" placeholder="456 Business Ave, City, State ZIP" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} />
            <p className="text-xs text-muted-foreground">Optional — shown on invoices</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-type">Business Type</Label>
            <Input id="business-type" placeholder="e.g. IT Consulting, Plumbing, Real Estate" value={businessType} onChange={(e) => setBusinessType(e.target.value)} />
          </div>

          <Button className="w-full" onClick={handleProfileSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Next: Choose Your Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
