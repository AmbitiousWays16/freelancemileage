import { Button } from '@/components/ui/button';
import { Trip, RouteMapData } from '@/types/mileage';
import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { fetchMapImageAsBase64 } from '@/lib/mapUtils';
import { supabase } from '@/integrations/supabase/client';

interface ExportButtonProps {
  trips: Trip[];
  totalMiles: number;
}

const MILEAGE_RATE = 0.70; // 2025 IRS standard mileage rate

// HTML escape function to prevent XSS in PDF generation
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Fetch route data for legacy trips that don't have routeMapData
const fetchRouteDataForLegacyTrip = async (fromAddress: string, toAddress: string): Promise<RouteMapData | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return null;

    const { data, error } = await supabase.functions.invoke('google-maps-route', {
      body: { fromAddress, toAddress },
      headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
    });

    if (error || !data?.routeMapData) return null;
    return data.routeMapData as RouteMapData;
  } catch {
    return null;
  }
};

export const ExportButton = ({ trips, totalMiles }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    if (trips.length === 0) return;

    setIsExporting(true);
    
    try {
      const currentMonth = format(new Date(), 'MMMM yyyy');
      const reimbursement = totalMiles * MILEAGE_RATE;
      
      // Sort trips by date
      const sortedTrips = [...trips].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Fetch map images for all trips in parallel (secure server-side fetch)
      // For legacy trips without routeMapData, fetch fresh route data first
      const mapImagesPromises = sortedTrips.map(async (trip) => {
        let routeData = trip.routeMapData;
        
        // If no routeMapData, try to fetch it from addresses (legacy trip support)
        if (!routeData) {
          routeData = await fetchRouteDataForLegacyTrip(trip.fromAddress, trip.toAddress);
        }
        
        if (routeData) {
          return await fetchMapImageAsBase64(routeData);
        }
        return null;
      });
      const mapImages = await Promise.all(mapImagesPromises);

      // Generate route map sections for each trip (with XSS protection)
      const tripRouteSections = sortedTrips.map((trip, index) => {
        const safeFromAddress = escapeHtml(trip.fromAddress);
        const safeToAddress = escapeHtml(trip.toAddress);
        const safePurpose = escapeHtml(trip.businessPurpose);
        const safeProgram = escapeHtml(trip.program);
        
        const encodedFrom = encodeURIComponent(trip.fromAddress);
        const encodedTo = encodeURIComponent(trip.toAddress);
        const directionsUrl = `https://www.google.com/maps/dir/${encodedFrom}/${encodedTo}`;
        
        // Use securely fetched base64 image (no exposed API keys)
        const mapImageBase64 = mapImages[index];
        
        return `
          <div class="trip-detail" style="page-break-inside: avoid; margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
              <h3 style="margin: 0; color: #1a1a2e; font-size: 16px;">Trip ${index + 1}: ${format(new Date(trip.date), 'MMMM d, yyyy')}</h3>
              <span style="background: #dbeafe; color: #3b82f6; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 14px;">${trip.miles.toFixed(1)} miles</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
              <div>
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
                <p style="margin: 0; font-size: 13px; color: #1a1a2e;">${safeFromAddress}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">To</p>
                <p style="margin: 0; font-size: 13px; color: #1a1a2e;">${safeToAddress}</p>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
              <div>
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Business Purpose</p>
                <p style="margin: 0; font-size: 13px; color: #1a1a2e;">${safePurpose}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Client/Project</p>
                <p style="margin: 0; font-size: 13px; color: #1a1a2e;">${safeProgram}</p>
              </div>
            </div>
            <div style="background: #f8fafc; border-radius: 6px; padding: 15px; text-align: center;">
              ${mapImageBase64 ? `
                <img src="${mapImageBase64}" alt="Route Map" style="width: 100%; max-width: 600px; height: auto; border-radius: 6px; margin-bottom: 10px;" />
              ` : `
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">Route Map</p>
              `}
              <a href="${directionsUrl}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 13px;">
                📍 View Route on Google Maps →
              </a>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8;">
                ${safeFromAddress} → ${safeToAddress}
              </p>
            </div>
          </div>
        `;
      }).join('');

      // Create HTML content for the comprehensive voucher
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mileage Log - ${currentMonth}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a2e; line-height: 1.5; }
            
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding: 30px 20px;
              border-radius: 8px;
              background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            }
            .header h1 { color: white; font-size: 28px; margin-bottom: 8px; }
            .header p { color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; }
            
            .summary { 
              display: flex; 
              justify-content: space-around; 
              margin-bottom: 30px; 
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); 
              padding: 25px; 
              border-radius: 12px;
              border: 1px solid #bfdbfe;
            }
            .summary-item { text-align: center; }
            .summary-item .value { font-size: 28px; font-weight: bold; color: #1e40af; }
            .summary-item .label { font-size: 12px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
            
            .section-title {
              font-size: 18px;
              color: #1a1a2e;
              margin: 30px 0 20px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #e2e8f0;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px;
              font-size: 12px;
            }
            th { 
              background: #3b82f6; 
              color: white; 
              padding: 12px 8px; 
              text-align: left; 
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            td { 
              padding: 12px 8px; 
              border-bottom: 1px solid #e2e8f0; 
            }
            tr:nth-child(even) { background: #f8fafc; }
            .total-row { 
              font-weight: bold; 
              background: #dbeafe !important; 
              font-size: 13px;
            }
            
            .tax-note {
              margin-top: 30px;
              padding: 20px;
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              font-size: 13px;
              color: #92400e;
            }
            
            .tax-note strong {
              display: block;
              margin-bottom: 8px;
              color: #78350f;
            }
            
            .page-break { page-break-before: always; }
            
            @media print { 
              body { padding: 20px; }
              .page-break { page-break-before: always; }
              /* Hint to the browser to preserve colors where applicable */
              * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MILEAGE LOG</h1>
            <p>${currentMonth} • Business Mileage Record</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="value">${trips.length}</div>
              <div class="label">Total Trips</div>
            </div>
            <div class="summary-item">
              <div class="value">${totalMiles.toFixed(1)}</div>
              <div class="label">Total Miles</div>
            </div>
            <div class="summary-item">
              <div class="value">$${reimbursement.toFixed(2)}</div>
              <div class="label">Deduction @ $${MILEAGE_RATE}/mi</div>
            </div>
          </div>

          <h2 class="section-title">Trip Summary</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 8%">#</th>
                <th style="width: 12%">Date</th>
                <th style="width: 22%">From</th>
                <th style="width: 22%">To</th>
                <th style="width: 18%">Purpose</th>
                <th style="width: 10%">Client</th>
                <th style="width: 8%">Miles</th>
              </tr>
            </thead>
            <tbody>
              ${sortedTrips.map((trip, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${format(new Date(trip.date), 'MM/dd/yyyy')}</td>
                  <td>${escapeHtml(trip.fromAddress)}</td>
                  <td>${escapeHtml(trip.toAddress)}</td>
                  <td>${escapeHtml(trip.businessPurpose)}</td>
                  <td>${escapeHtml(trip.program)}</td>
                  <td>${trip.miles.toFixed(1)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="6" style="text-align: right;">TOTAL MILES:</td>
                <td>${totalMiles.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>

          <div class="tax-note">
            <strong>📋 Tax Documentation Note</strong>
            This mileage log documents business travel for tax deduction purposes. 
            The 2025 IRS standard mileage rate is $${MILEAGE_RATE} per mile for business use. 
            Keep this record with your tax documents. 
            Total potential deduction: $${reimbursement.toFixed(2)}
          </div>

          <div class="page-break"></div>
          
          <div class="header">
            <h1>TRIP ROUTE DETAILS</h1>
            <p>${currentMonth} - Individual Trip Documentation</p>
          </div>

          ${tripRouteSections}

        </body>
        </html>
      `;

      // Open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={trips.length === 0 || isExporting}
      className="gradient-primary"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
};