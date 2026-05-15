import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';

export default function Settings() {
  return (
    <Layout>
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Configurações</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie as configurações do painel.</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supabase</CardTitle>
              <CardDescription>
                Configurações do banco de dados. Defina as variáveis de ambiente no arquivo <code className="text-indigo-400 bg-indigo-500/10 px-1 rounded">.env</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>VITE_SUPABASE_URL</Label>
                <Input
                  value={import.meta.env.VITE_SUPABASE_URL ?? ''}
                  readOnly
                  className="font-mono text-xs text-gray-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label>VITE_SUPABASE_ANON_KEY</Label>
                <Input
                  value={import.meta.env.VITE_SUPABASE_ANON_KEY ? '••••••••••••••••••••' : ''}
                  readOnly
                  className="font-mono text-xs text-gray-500"
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sobre a integração com Meta Ads</CardTitle>
              <CardDescription>Como funciona a conexão com a API da Meta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                <Info className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-400 space-y-2">
                  <p>Os dados de campanha são buscados diretamente da API do Marketing da Meta usando o Access Token configurado por cliente.</p>
                  <p>O token de acesso é armazenado de forma criptografada no Supabase e nunca é exposto no front-end de forma visível.</p>
                  <p>Os dados são atualizados em tempo real — cada vez que você abre um cliente ou clica em "Atualizar".</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-400 font-medium">Métricas monitoradas:</p>
                <ul className="space-y-1 text-gray-500 list-disc list-inside">
                  <li>Resultado e Custo por Resultado (baseado no tipo definido por cliente)</li>
                  <li>Valor gasto no período</li>
                  <li>CTR — Taxa de cliques (Click-Through Rate)</li>
                  <li>CPC — Custo por clique</li>
                  <li>CPM — Custo por mil impressões</li>
                  <li>Impressões e Cliques totais</li>
                </ul>
              </div>

              <div className="pt-2">
                <a
                  href="https://developers.facebook.com/docs/marketing-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center h-7 px-3 text-xs gap-1.5 rounded-lg font-medium border border-[#2a2a38] text-gray-300 hover:bg-[#1e1e2a] hover:text-white transition-all duration-150"
                >
                  Documentação da API
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
