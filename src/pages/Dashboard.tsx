import { useState } from 'react';
import { Plus, Search, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Layout } from '@/components/Layout';
import { ClientCard } from '@/components/ClientCard';
import { AddClientModal } from '@/components/AddClientModal';
import { useClients } from '@/hooks/useClients';
import type { Client } from '@/types';

export default function Dashboard() {
  const { data: clients, isLoading, error } = useClients();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const filtered = (clients ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      (c.niche ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (client: Client) => {
    setEditClient(client);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditClient(null);
    setModalOpen(true);
  };

  const alertCount = (clients ?? []).reduce((acc, c) => {
    return acc + (c.metric_limits?.length ?? 0);
  }, 0);

  return (
    <Layout>
      <div className="flex flex-col min-h-screen">
        {/* Page header */}
        <div className="border-b border-[#1e1e2a] bg-[#0d0d15]/50 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4 px-8 h-14">
            <h1 className="text-base font-semibold text-white">Painel de Anúncios</h1>
            <Button size="md" onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo cliente
            </Button>
          </div>
        </div>

        <div className="p-8 flex-1">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-[#2a2a38] bg-[#12121a] p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total de clientes</p>
                <p className="text-xl font-semibold text-white">{clients?.length ?? 0}</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#2a2a38] bg-[#12121a] p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Contas conectadas</p>
                <p className="text-xl font-semibold text-white">{clients?.length ?? 0}</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#2a2a38] bg-[#12121a] p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Limites configurados</p>
                <p className="text-xl font-semibold text-white">{alertCount}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                placeholder="Buscar cliente, empresa ou nicho..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-sm text-gray-600">
              {filtered.length} cliente{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mb-3" />
              <p className="text-gray-300 font-medium text-lg">Erro ao carregar clientes</p>
              <p className="text-sm text-gray-500 mt-1">Verifique suas variáveis de ambiente do Supabase.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-[#1a1a24] flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-700" />
              </div>
              <p className="text-gray-300 font-medium text-lg">
                {search ? 'Nenhum resultado encontrado' : 'Nenhum cliente cadastrado'}
              </p>
              <p className="text-sm text-gray-600 mt-1 max-w-xs">
                {search
                  ? 'Tente buscar por outro termo.'
                  : 'Clique em "Novo cliente" para começar a monitorar suas contas de anúncios.'}
              </p>
              {!search && (
                <Button className="mt-6 gap-2" onClick={handleAdd}>
                  <Plus className="h-4 w-4" />
                  Adicionar primeiro cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((client) => (
                <ClientCard key={client.id} client={client} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddClientModal
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) setEditClient(null); }}
        editClient={editClient}
      />
    </Layout>
  );
}
