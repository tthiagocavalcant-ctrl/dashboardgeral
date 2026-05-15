import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, ArrowRight, Pencil, Trash2, Wifi, WifiOff, Building2, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Client } from '@/types';
import { RESULT_TYPE_LABELS } from '@/types';
import { useDeleteClient } from '@/hooks/useClients';
import { toast } from 'sonner';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
}

export function ClientCard({ client, onEdit }: ClientCardProps) {
  const navigate = useNavigate();
  const deleteClient = useDeleteClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [connected] = useState<boolean | null>(null);

  const alerts = (client.metric_limits ?? []).length;

  const handleDelete = async () => {
    if (!confirm(`Excluir o cliente "${client.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteClient.mutateAsync(client.id);
      toast.success('Cliente excluído.');
    } catch {
      toast.error('Erro ao excluir cliente.');
    }
  };

  return (
    <Card className="hover:border-[#3a3a50] transition-colors group relative">
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{client.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-gray-500 text-xs">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{client.company}</span>
            </div>
          </div>

          {/* Actions menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-md text-gray-600 hover:text-gray-300 hover:bg-[#1e1e2a] transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-[#2a2a38] bg-[#12121a] shadow-xl py-1">
                  <button
                    onClick={() => { onEdit(client); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-300 hover:bg-[#1e1e2a] hover:text-white transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => { handleDelete(); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {client.niche && (
            <Badge variant="outline">
              <Tag className="h-2.5 w-2.5" />
              {client.niche}
            </Badge>
          )}
          <Badge variant="info">{RESULT_TYPE_LABELS[client.result_type]}</Badge>
        </div>

        {/* Meta account */}
        <div className="flex items-center gap-1.5 text-xs mb-4 text-gray-500">
          {connected === false ? (
            <WifiOff className="h-3.5 w-3.5 text-red-400" />
          ) : (
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          )}
          <span className="font-mono truncate">act_{client.ad_account_id}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1e1e2a]">
          <span className="text-xs text-gray-600">
            {alerts > 0 ? (
              <span className="text-amber-400">{alerts} limite{alerts > 1 ? 's' : ''} configurado{alerts > 1 ? 's' : ''}</span>
            ) : (
              'Sem limites configurados'
            )}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 text-indigo-400 hover:text-indigo-300"
            onClick={() => navigate(`/client/${client.id}`)}
          >
            Ver campanhas
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
