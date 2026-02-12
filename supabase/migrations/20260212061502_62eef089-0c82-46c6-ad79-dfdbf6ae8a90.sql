
-- Create gas_expenses table
CREATE TABLE public.gas_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  gallons NUMERIC NOT NULL DEFAULT 0,
  price_per_gallon NUMERIC NOT NULL DEFAULT 0,
  station_name TEXT NOT NULL DEFAULT '',
  receipt_url TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gas_expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own gas expenses"
ON public.gas_expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gas expenses"
ON public.gas_expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gas expenses"
ON public.gas_expenses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gas expenses"
ON public.gas_expenses FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_gas_expenses_updated_at
BEFORE UPDATE ON public.gas_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for gas receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('gas-receipts', 'gas-receipts', true);

-- Storage policies
CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'gas-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gas-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'gas-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
