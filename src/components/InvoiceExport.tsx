import { useState, useMemo } from 'react';
import { Trip } from '@/types/mileage';
import { Profile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface InvoiceExportProps {
  trips: Trip[];
  profile: Profile | null;
}

const MILEAGE_RATE = 0.70;

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const InvoiceExport = ({ trips, profile }: InvoiceExportProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [open, setOpen] = useState(false);

  // Group trips by program/client
  const groupedTrips = useMemo(() => {
    const groups: Record<string, Trip[]> = {};
    trips.forEach(trip => {
      const key = trip.program;
      if (!groups[key]) groups[key] = [];
      groups[key].push(trip);
    });
    return groups;
  }, [trips]);

  const toggleTrip = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (program: string) => {
    const groupIds = groupedTrips[program].map(t => t.id);
    const allSelected = groupIds.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      groupIds.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === trips.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(trips.map(t => t.id)));
    }
  };

  const selectedTrips = trips.filter(t => selectedIds.has(t.id));
  const selectedMiles = selectedTrips.reduce((sum, t) => sum + t.miles, 0);
  const totalAmount = selectedMiles * MILEAGE_RATE;

  const generateInvoice = () => {
    if (selectedTrips.length === 0) return;
    setIsExporting(true);

    const sorted = [...selectedTrips].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const invoiceNum = `INV-${format(new Date(), 'yyyyMMdd-HHmmss')}`;
    const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : '';

    const html = `<!DOCTYPE html><html><head><title>Invoice ${invoiceNum}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',Arial,sans-serif;padding:40px;color:#1a1a2e;line-height:1.6}
.inv-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:20px;border-bottom:3px solid #3b82f6}
.inv-title{font-size:32px;font-weight:700;color:#3b82f6;letter-spacing:-0.5px}
.inv-meta{text-align:right;font-size:13px;color:#64748b}
.inv-meta strong{color:#1a1a2e;display:block;font-size:14px}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:30px}
.party h3{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:8px}
.party p{font-size:13px;margin:2px 0}
table{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
th{background:#3b82f6;color:#fff;padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
td{padding:10px 8px;border-bottom:1px solid #e2e8f0}
tr:nth-child(even){background:#f8fafc}
.totals{margin-top:20px;text-align:right}
.totals .line{display:flex;justify-content:flex-end;gap:40px;padding:6px 0;font-size:14px}
.totals .grand{font-size:18px;font-weight:700;color:#3b82f6;border-top:2px solid #3b82f6;padding-top:10px;margin-top:6px}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center}
@media print{body{padding:20px}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="inv-header">
${profile?.company_banner_url ? `<div style="margin-bottom:15px"><img src="${profile.company_banner_url}" alt="Company Banner" style="width:100%;max-height:120px;object-fit:cover;border-radius:6px"/></div>` : ''}
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #3b82f6">
    <div style="display:flex;align-items:center;gap:15px">
      ${profile?.company_logo_url ? `<img src="${profile.company_logo_url}" alt="Logo" style="height:50px;width:50px;object-fit:contain;border-radius:8px"/>` : ''}
      <div class="inv-title">INVOICE</div>
    </div>
    <div class="inv-meta">
      <strong>${escapeHtml(invoiceNum)}</strong>
      Date: ${format(new Date(), 'MMMM d, yyyy')}<br/>
      Due: Upon Receipt
    </div>
  </div>
</div>
<div class="parties">
  <div class="party">
    <h3>From</h3>
    <p><strong>${escapeHtml(fullName)}</strong></p>
    ${profile?.business_type ? `<p>${escapeHtml(profile.business_type)}</p>` : ''}
    ${profile?.business_address ? `<p>${escapeHtml(profile.business_address)}</p>` : profile?.home_address ? `<p>${escapeHtml(profile.home_address)}</p>` : ''}
    ${profile?.email ? `<p>${escapeHtml(profile.email)}</p>` : ''}
  </div>
  <div class="party">
    <h3>Bill To</h3>
    <p><strong>${escapeHtml(sorted[0].program)}</strong></p>
  </div>
</div>
<table>
  <thead><tr><th>#</th><th>Date</th><th>From</th><th>To</th><th>Purpose</th><th style="text-align:right">Miles</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>
    ${sorted.map((t, i) => `<tr>
      <td>${i + 1}</td>
      <td>${format(new Date(t.date), 'MM/dd/yyyy')}</td>
      <td>${escapeHtml(t.fromAddress)}</td>
      <td>${escapeHtml(t.toAddress)}</td>
      <td>${escapeHtml(t.businessPurpose)}</td>
      <td style="text-align:right">${t.miles.toFixed(1)}</td>
      <td style="text-align:right">$${(t.miles * MILEAGE_RATE).toFixed(2)}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="totals">
  <div class="line"><span>Total Miles:</span><span>${selectedMiles.toFixed(1)}</span></div>
  <div class="line"><span>Rate:</span><span>$${MILEAGE_RATE.toFixed(2)}/mile</span></div>
  <div class="line grand"><span>Amount Due:</span><span>$${totalAmount.toFixed(2)}</span></div>
</div>
<div class="footer">
  Mileage billed at the 2025 IRS standard rate of $${MILEAGE_RATE}/mile.
</div>
</body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 250);
    }
    setIsExporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={trips.length === 0}>
          <FileText className="mr-2 h-4 w-4" />
          Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={selectAll}>
              {selectedIds.size === trips.length ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} trip{selectedIds.size !== 1 ? 's' : ''} · {selectedMiles.toFixed(1)} mi · ${totalAmount.toFixed(2)}
            </span>
          </div>
          <ScrollArea className="h-[350px] pr-2">
            <div className="space-y-4">
              {Object.entries(groupedTrips).map(([program, groupTrips]) => {
                const allSelected = groupTrips.every(t => selectedIds.has(t.id));
                const someSelected = groupTrips.some(t => selectedIds.has(t.id));
                return (
                  <div key={program} className="space-y-1">
                    <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={() => toggleGroup(program)}
                      />
                      <span className="text-sm font-medium">{program}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{groupTrips.length} trips</span>
                    </div>
                    {groupTrips.map(trip => (
                      <label key={trip.id} className="flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 hover:bg-muted/50">
                        <Checkbox
                          checked={selectedIds.has(trip.id)}
                          onCheckedChange={() => toggleTrip(trip.id)}
                        />
                        <span className="flex-1 truncate text-sm">
                          {format(parseISO(trip.date), 'MMM d')} — {trip.fromAddress.split(',')[0]} → {trip.toAddress.split(',')[0]}
                        </span>
                        <span className="text-xs text-muted-foreground">{trip.miles.toFixed(1)} mi</span>
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <Button className="w-full" disabled={selectedIds.size === 0 || isExporting} onClick={generateInvoice}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generate Invoice ({selectedIds.size} trip{selectedIds.size !== 1 ? 's' : ''})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
