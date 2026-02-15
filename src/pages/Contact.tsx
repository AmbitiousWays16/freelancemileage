import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const ticketSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
});

const Contact = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const validation = ticketSchema.safeParse({ subject, message });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        subject: validation.data.subject,
        message: validation.data.message,
      });

      if (error) throw error;

      // Send email notification to admin
      try {
        await supabase.functions.invoke('send-support-email', {
          body: {
            subject: validation.data.subject,
            message: validation.data.message,
            userEmail: user.email,
          },
        });
      } catch {
        // Non-critical - ticket still saved
      }

      setSubmitted(true);
      toast.success('Support ticket submitted!');
    } catch {
      toast.error('Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-success mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Ticket Submitted!</h2>
            <p className="text-muted-foreground">
              We've received your request and will get back to you as soon as possible.
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => { setSubmitted(false); setSubject(''); setMessage(''); }}>
                Submit Another
              </Button>
              <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle as="h1">Contact Support</CardTitle>
                <CardDescription>Need help? Send us a message and we'll get back to you.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">{message.length}/2000 characters</p>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit Ticket
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
