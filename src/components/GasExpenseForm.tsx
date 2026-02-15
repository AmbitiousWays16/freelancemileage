import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Fuel, Upload, X, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { GasExpense } from '@/hooks/useGasExpenses';

interface GasExpenseFormProps {
  onSubmit: (expense: Omit<GasExpense, 'id' | 'createdAt'>) => Promise<unknown>;
  onUploadReceipt: (file: File) => Promise<string | null>;
}

export const GasExpenseForm = ({ onSubmit, onUploadReceipt }: GasExpenseFormProps) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState('');
  const [gallons, setGallons] = useState('');
  const [pricePerGallon, setPricePerGallon] = useState('');
  const [stationName, setStationName] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptPreview, setReceiptPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleGallonsChange = (val: string) => {
    setGallons(val);
    if (val && pricePerGallon) setAmount((parseFloat(val) * parseFloat(pricePerGallon)).toFixed(2));
  };

  const handlePriceChange = (val: string) => {
    setPricePerGallon(val);
    if (val && gallons) setAmount((parseFloat(gallons) * parseFloat(val)).toFixed(2));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setReceiptPreview(URL.createObjectURL(file));
    const url = await onUploadReceipt(file);
    if (url) setReceiptUrl(url);
    setUploading(false);
  };

  const clearReceipt = () => {
    setReceiptUrl('');
    setReceiptPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;
    setSubmitting(true);
    const result = await onSubmit({
      date,
      amount: parseFloat(amount),
      gallons: parseFloat(gallons) || 0,
      pricePerGallon: parseFloat(pricePerGallon) || 0,
      stationName,
      receiptUrl,
      notes,
    });
    if (result) {
      setAmount(''); setGallons(''); setPricePerGallon('');
      setStationName(''); setNotes(''); clearReceipt();
    }
    setSubmitting(false);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Fuel className="h-5 w-5 text-accent" />
          Log Gas Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="gas-date">Date</Label>
              <Input id="gas-date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gas-station">Station</Label>
              <Input id="gas-station" placeholder="Shell, BP..." value={stationName} onChange={e => setStationName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="gas-gallons">Gallons</Label>
              <Input id="gas-gallons" type="number" step="0.001" placeholder="0.000" value={gallons} onChange={e => handleGallonsChange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gas-ppg">$/Gallon</Label>
              <Input id="gas-ppg" type="number" step="0.001" placeholder="0.000" value={pricePerGallon} onChange={e => handlePriceChange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gas-amount">Total $</Label>
              <Input id="gas-amount" type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gas-notes">Notes</Label>
            <Textarea id="gas-notes" placeholder="Optional notes..." rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Receipt Photo</Label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {receiptPreview ? (
              <div className="relative inline-block">
                <img src={receiptPreview} alt="Gas expense receipt preview" className="h-24 w-24 rounded-lg border border-border object-cover" />
                <button type="button" onClick={clearReceipt} className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading...' : <><Upload className="mr-2 h-4 w-4" />Attach Receipt</>}
              </Button>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={submitting || !amount}>
            {submitting ? 'Saving...' : 'Add Gas Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
