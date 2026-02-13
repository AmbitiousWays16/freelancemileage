import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Profile {
  first_name: string;
  last_name: string;
  home_address: string;
  business_address: string;
  business_type: string;
  profile_completed: boolean;
  email: string | null;
  company_logo_url: string;
  company_banner_url: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, home_address, business_address, business_type, profile_completed, email, company_logo_url, company_banner_url')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!error && data) {
      setProfile(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (updates: Partial<Profile>) => {
    if (!user) return false;
    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });
    if (error) {
      toast.error('Failed to save profile');
      return false;
    }
    setProfile(prev => prev ? { ...prev, ...updates } : {
      first_name: '',
      last_name: '',
      home_address: '',
      business_address: '',
      business_type: '',
      profile_completed: false,
      email: null,
      company_logo_url: '',
      company_banner_url: '',
      ...updates,
    } as Profile);
    return true;
  };

  const uploadBranding = async (file: File, type: 'logo' | 'banner'): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${type}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('company-branding')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error(`Failed to upload ${type}`);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('company-branding')
      .getPublicUrl(path);

    const url = urlData.publicUrl;
    const field = type === 'logo' ? 'company_logo_url' : 'company_banner_url';
    await saveProfile({ [field]: url });
    return url;
  };

  return { profile, loading, saveProfile, uploadBranding, refetch: fetchProfile };
};
