import { useEffect, useState, type FormEvent } from 'react';
import { userApi } from '../api/client';
import type { Team } from '../types';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    setLoading(true);
    const { data } = await userApi.get('/teams');
    setTeams(data);
    setLoading(false);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await userApi.post('/teams', { name, description: description || undefined });
      setName('');
      setDescription('');
      loadTeams();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette équipe ?')) return;
    await userApi.delete(`/teams/${id}`);
    loadTeams();
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Gestion des équipes</h1>

      <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-lg p-6 mb-6 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'équipe</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700">
          Créer
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {teams.map((team) => (
            <div key={team.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-slate-900">{team.name}</p>
                {team.description && <p className="text-sm text-slate-500">{team.description}</p>}
                <p className="text-xs text-slate-400 mt-1">{team.profiles?.length || 0} membre(s)</p>
              </div>
              <button onClick={() => handleDelete(team.id)} className="text-sm text-red-600 hover:underline">
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
