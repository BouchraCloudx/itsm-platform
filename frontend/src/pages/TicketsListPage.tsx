import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import type { Ticket } from '../types';

export default function TicketsListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const { data } = await ticketApi.get('/tickets');
      setTickets(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-slate-500">Chargement...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {user?.role === 'USER' ? 'Mes tickets' : 'Tous les tickets'}
          </h1>
          <p className="text-sm text-slate-500">{tickets.length} ticket(s)</p>
        </div>
        <Link
          to="/tickets/new"
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Nouveau ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
          Aucun ticket pour l'instant. Créez-en un pour commencer.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-900">{ticket.title}</p>
                <p className="text-sm text-slate-500">{ticket.category} · créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={ticket.priority} variant="priority" />
                <Badge label={ticket.status} variant="status" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
