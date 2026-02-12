import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface GasExpense {
  id: string;
  date: string;
  amount: number;
  gallons: number;
  pricePerGallon: number;
  stationName: string;
  receiptUrl: string;
  notes: string;
  createdAt: Date;
}

export const useGasExpenses = (selectedMonth: Date) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<GasExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!user) { setExpenses([]); setLoading(false); return; }
    try {
      setLoading(true);
      const monthStart = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('gas_expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: false });

      if (error) throw error;

      setExpenses((data || []).map(e => ({
        id: e.id,
        date: e.date,
        amount: Number(e.amount),
        gallons: Number(e.gallons),
        pricePerGallon: Number(e.price_per_gallon),
        stationName: e.station_name,
        receiptUrl: e.receipt_url,
        notes: e.notes,
        createdAt: new Date(e.created_at),
      })));
    } catch (error) {
      console.error('Error fetching gas expenses:', error);
      toast.error('Failed to load gas expenses');
    } finally {
      setLoading(false);
    }
  }, [user, selectedMonth]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const addExpense = useCallback(async (expense: Omit<GasExpense, 'id' | 'createdAt'>) => {
    if (!user) { toast.error('You must be logged in'); return null; }
    try {
      const { data, error } = await supabase
        .from('gas_expenses')
        .insert({
          user_id: user.id,
          date: expense.date,
          amount: expense.amount,
          gallons: expense.gallons,
          price_per_gallon: expense.pricePerGallon,
          station_name: expense.stationName,
          receipt_url: expense.receiptUrl,
          notes: expense.notes,
        })
        .select()
        .single();

      if (error) throw error;

      const newExpense: GasExpense = {
        id: data.id,
        date: data.date,
        amount: Number(data.amount),
        gallons: Number(data.gallons),
        pricePerGallon: Number(data.price_per_gallon),
        stationName: data.station_name,
        receiptUrl: data.receipt_url,
        notes: data.notes,
        createdAt: new Date(data.created_at),
      };

      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } catch (error) {
      console.error('Error adding gas expense:', error);
      toast.error('Failed to add gas expense');
      return null;
    }
  }, [user]);

  const deleteExpense = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('gas_expenses').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast.success('Gas expense deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete gas expense');
    }
  }, [user]);

  const uploadReceipt = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('gas-receipts').upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('gas-receipts').getPublicUrl(path);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast.error('Failed to upload receipt');
      return null;
    }
  }, [user]);

  const totalGasSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalGallons = expenses.reduce((sum, e) => sum + e.gallons, 0);

  return { expenses, loading, addExpense, deleteExpense, uploadReceipt, totalGasSpent, totalGallons, refetch: fetchExpenses };
};
