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
      .select('first_name, last_name, home_address, business_address, business_type, profile_completed, email')
      .eq('user_id', user.id)
      .single();
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
      .update(updates)
      .eq('user_id', user.id);
    if (error) {
      toast.error('Failed to save profile');
      return false;
    }
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    return true;
  };

  return { profile, loading, saveProfile, refetch: fetchProfile };
};
