import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ticketApi, authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import type { Ticket } from '../types';

interface Technician {
  id: string;
  email: string;
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const canManage = user?.role === 'TECHNICIAN' || user?.role === 'ADMIN';

  useEffect(() => {
    loadTicket();
    if (canManage) loadTechnicians();
  }, [id]);

  async function loadTicket() {
    setLoading(true);
    const { data } = await ticketApi.get(`/tickets/${id}`);
    setTicket(data);
    setLoading(false);
  }

  async function loadTechnicians() {
    try {
      const { data } = await authApi.get('/auth/technicians');
      setTechnicians(data);
    } catch {
      setTechnicians([]);
    }
  }

  async function handleStatusChange(status: string) {
    await ticketApi.patch(`/tickets/${id}/status`, { status });
    loadTicket();
  }

  async function handleReassign() {
    if (!selectedTech) return;
    await ticketApi.patch(`/tickets/${id}/assign`, { technicianId: selectedTech });
    setSelectedTech('');
    loadTicket();
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    await ticketApi.post(`/tickets/${id}/comments`, { content: comment });
    setComment('');
    loadTicket();
  }

  if (loading) return <div className="p-8 text-slate-500">Chargement...</div>;
  if (!ticket) return <div className="p-8 text-slate-500">Ticket introuvable</div>;

  const assignedTechnician = technicians.find((t) => t.id === ticket.assignedTo);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link to="/" className="text-sm text-slate-500 hover:underline">&larr; Retour aux tickets</Link>

      <div className="bg-white border border-slate-200 rounded-lg p-6 mt-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{ticket.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {ticket.category} · créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Assigné à : {assignedTechnician ? assignedTechnician.email : ticket.assignedTo ? ticket.assignedTo : 'Non assigné'}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge label={ticket.priority} variant="priority" />
            <Badge label={ticket.status} variant="status" />
          </div>
        </div>

        <p className="text-slate-700 whitespace-pre-wrap">{ticket.description}</p>

        {canManage && (
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Changer le statut</label>
              <div className="flex gap-2">
                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={ticket.status === status}
                    className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Réassigner à un autre technicien</label>
              <div className="flex gap-2">
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choisir un technicien</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>{tech.email}</option>
                  ))}
                </select>
                <button
                  onClick={handleReassign}
                  disabled={!selectedTech}
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Réassigner
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 mt-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Commentaires</h2>

        <div className="space-y-3 mb-4">
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map((c) => (
              <div key={c.id} className="bg-slate-50 rounded-md p-3">
                <p className="text-sm text-slate-700">{c.content}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(c.createdAt).toLocaleString('fr-FR')}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">Aucun commentaire pour l'instant.</p>
          )}
        </div>

        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}
