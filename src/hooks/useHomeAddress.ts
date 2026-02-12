import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useHomeAddress = () => {
  const { user } = useAuth();
  const [homeAddress, setHomeAddress] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHomeAddress = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('home_address')
      .eq('user_id', user.id)
      .single();
    if (!error && data) {
      setHomeAddress(data.home_address || '');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHomeAddress();
  }, [fetchHomeAddress]);

  const saveHomeAddress = async (address: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ home_address: address })
      .eq('user_id', user.id);
    if (error) {
      toast.error('Failed to save home address');
    } else {
      setHomeAddress(address);
      toast.success('Home address saved');
    }
  };

  return { homeAddress, loading, saveHomeAddress };
};
