import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Shield, Users, TicketCheck, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  business_type: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    const checkAdmin = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (data && data.length > 0) {
        setIsAdmin(true);
      }
      setChecking(false);
    };

    checkAdmin();
  }, [user, authLoading]);

  useEffect(() => {
    if (!isAdmin) return;

    const loadData = async () => {
      setLoadingData(true);
      const [ticketsRes, usersRes] = await Promise.all([
        supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('user_id, first_name, last_name, email, business_type, created_at').order('created_at', { ascending: false }),
      ]);

      if (ticketsRes.data) setTickets(ticketsRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      setLoadingData(false);
    };

    loadData();
  }, [isAdmin]);

  const handleRespond = async (ticketId: string) => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ admin_response: response, status: 'responded' })
        .eq('id', ticketId);

      if (error) throw error;

      // Find ticket to get user email for notification
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        const userProfile = users.find(u => u.user_id === ticket.user_id);
        if (userProfile?.email) {
          try {
            await supabase.functions.invoke('send-support-email', {
              body: {
                subject: `Re: ${ticket.subject}`,
                message: response,
                userEmail: userProfile.email,
                isAdminResponse: true,
              },
            });
          } catch {
            // Non-critical
          }
        }
      }

      setTickets(prev => prev.map(t =>
        t.id === ticketId ? { ...t, admin_response: response, status: 'responded' } : t
      ));
      setRespondingTo(null);
      setResponse('');
      toast.success('Response sent!');
    } catch {
      toast.error('Failed to send response');
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: 'closed' })
      .eq('id', ticketId);

    if (error) {
      toast.error('Failed to close ticket');
      return;
    }

    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status: 'closed' } : t
    ));
    toast.success('Ticket closed');
  };

  if (authLoading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <Shield className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground">You do not have admin permissions.</p>
            <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'responded': return 'default';
      case 'closed': return 'secondary';
      default: return 'outline';
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-5xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">Manage users and support tickets</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <TicketCheck className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{tickets.length}</p>
                <p className="text-xs text-muted-foreground">Total Tickets</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{openTickets}</p>
                <p className="text-xs text-muted-foreground">Open Tickets</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets">
          <TabsList>
            <TabsTrigger value="tickets">
              Support Tickets {openTickets > 0 && <Badge variant="destructive" className="ml-2 text-xs">{openTickets}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4 mt-4">
            {loadingData ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : tickets.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No support tickets yet.</CardContent></Card>
            ) : (
              tickets.map(ticket => {
                const ticketUser = users.find(u => u.user_id === ticket.user_id);
                return (
                  <Card key={ticket.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{ticket.subject}</CardTitle>
                          <CardDescription>
                            From: {ticketUser ? `${ticketUser.first_name} ${ticketUser.last_name}`.trim() || ticketUser.email : 'Unknown'} · {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
                          </CardDescription>
                        </div>
                        <Badge variant={statusColor(ticket.status) as any}>{ticket.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.message}</p>

                      {ticket.admin_response && (
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Admin Response:</p>
                          <p className="text-sm whitespace-pre-wrap">{ticket.admin_response}</p>
                        </div>
                      )}

                      {respondingTo === ticket.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Type your response..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleRespond(ticket.id)} disabled={sending}>
                              {sending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Send className="mr-1 h-3 w-3" />}
                              Send
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setRespondingTo(null); setResponse(''); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {ticket.status !== 'closed' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setRespondingTo(ticket.id)}>
                                Respond
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleCloseTicket(ticket.id)}>
                                Close Ticket
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            {loadingData ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">Email</th>
                          <th className="text-left p-3 font-medium">Business Type</th>
                          <th className="text-left p-3 font-medium">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.user_id} className="border-b last:border-0">
                            <td className="p-3">{`${u.first_name} ${u.last_name}`.trim() || '—'}</td>
                            <td className="p-3 text-muted-foreground">{u.email || '—'}</td>
                            <td className="p-3">{u.business_type || '—'}</td>
                            <td className="p-3 text-muted-foreground">{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
