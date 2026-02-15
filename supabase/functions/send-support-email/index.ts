import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const allowedOrigins = [
  'https://freelancemileage.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && (
    allowedOrigins.includes(origin) ||
    origin.endsWith('.lovable.app') ||
    origin.endsWith('.lovableproject.com')
  );
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
};

const ADMIN_EMAIL = "admin@miletrack.triptrackerapp.tech";

serve(async (req: Request) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { subject, message, userEmail, isAdminResponse } = await req.json();

    if (!subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing subject or message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const to = isAdminResponse ? userEmail : ADMIN_EMAIL;
    const from = "MileTrack Support <onboarding@resend.dev>";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">
              ${isAdminResponse ? 'Support Response' : 'New Support Ticket'}
            </h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            ${!isAdminResponse ? `<p style="color: #666; margin-top: 0;">From: ${userEmail}</p>` : ''}
            <h3 style="color: #1e3a5f; margin-top: 0;">${subject}</h3>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
              <p style="white-space: pre-wrap; margin: 0;">${message}</p>
            </div>
            ${!isAdminResponse ? `<p style="color: #666; font-size: 14px; margin-top: 16px;">Reply via the admin portal.</p>` : ''}
          </div>
          <p style="text-align: center; color: #999; font-size: 12px;">MileTrack Support</p>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from,
      to: [to],
      subject: isAdminResponse ? `MileTrack: ${subject}` : `[Support Ticket] ${subject}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Email error:', emailError);
      throw emailError;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('send-support-email error:', errMsg);
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { ...getCorsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' },
    });
  }
});
