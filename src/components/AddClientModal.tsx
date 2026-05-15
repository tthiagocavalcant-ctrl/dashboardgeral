import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, TestTube } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCreateClient, useUpdateClient } from '@/hooks/useClients';
import { testMetaConnection } from '@/lib/metaApi';
import type { Client, MetricLimit, MetricKey, ResultType } from '@/types';
import { RESULT_TYPE_LABELS, METRIC_LABELS, METRIC_IS_LOWER_BETTER } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  company: z.string().min(1, 'Empresa é obrigatória'),
  niche: z.string().optional(),
  result_type: z.string().min(1, 'Tipo de resultado é obrigatório'),
  ad_account_id: z.string().min(1, 'ID da conta é obrigatório'),
  access_token: z.string().min(1, 'Token de acesso é obrigatório'),
});

type FormValues = z.infer<typeof schema>;

const METRICS: MetricKey[] = ['cpl', 'ctr', 'cpc', 'cpm', 'spend'];

interface LimitInputs {
  cpl_max: string;
  ctr_min: string;
  cpc_max: string;
  cpm_max: string;
  spend_max: string;
}

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editClient?: Client | null;
}

export function AddClientModal({ open, onOpenChange, editClient }: AddClientModalProps) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [limits, setLimits] = useState<LimitInputs>({
    cpl_max: '', ctr_min: '', cpc_max: '', cpm_max: '', spend_max: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const adAccountId = watch('ad_account_id');
  const accessToken = watch('access_token');

  useEffect(() => {
    if (editClient) {
      reset({
        name: editClient.name,
        company: editClient.company,
        niche: editClient.niche ?? '',
        result_type: editClient.result_type,
        ad_account_id: editClient.ad_account_id,
        access_token: editClient.access_token,
      });
      const clientLimits = editClient.metric_limits ?? [];
      const getLimit = (metric: MetricKey, field: 'max_value' | 'min_value') =>
        clientLimits.find((l) => l.metric === metric)?.[field]?.toString() ?? '';
      setLimits({
        cpl_max: getLimit('cpl', 'max_value'),
        ctr_min: getLimit('ctr', 'min_value'),
        cpc_max: getLimit('cpc', 'max_value'),
        cpm_max: getLimit('cpm', 'max_value'),
        spend_max: getLimit('spend', 'max_value'),
      });
    } else {
      reset({ name: '', company: '', niche: '', result_type: '', ad_account_id: '', access_token: '' });
      setLimits({ cpl_max: '', ctr_min: '', cpc_max: '', cpm_max: '', spend_max: '' });
    }
    setTestResult(null);
  }, [editClient, open, reset]);

  const buildLimits = (): Omit<MetricLimit, 'id' | 'client_id'>[] => {
    const result: Omit<MetricLimit, 'id' | 'client_id'>[] = [];
    METRICS.forEach((metric) => {
      const isLowerBetter = METRIC_IS_LOWER_BETTER[metric];
      if (isLowerBetter) {
        const key = `${metric}_max` as keyof LimitInputs;
        const val = parseFloat(limits[key]);
        if (!isNaN(val) && val > 0) result.push({ metric, max_value: val, min_value: null });
      } else {
        const key = `${metric}_min` as keyof LimitInputs;
        const val = parseFloat(limits[key]);
        if (!isNaN(val) && val > 0) result.push({ metric, min_value: val, max_value: null });
      }
    });
    return result;
  };

  const handleTest = async () => {
    if (!adAccountId || !accessToken) {
      toast.error('Preencha o ID da conta e o token de acesso primeiro.');
      return;
    }
    setTesting(true);
    const result = await testMetaConnection(adAccountId, accessToken);
    setTestResult(result);
    setTesting(false);
    if (result.ok) {
      toast.success('Conexão com a Meta confirmada!');
    } else {
      toast.error(`Falha na conexão: ${result.error}`);
    }
  };

  const onSubmit = async (data: FormValues) => {
    const metricLimits = buildLimits();
    try {
      if (editClient) {
        await updateClient.mutateAsync({
          id: editClient.id,
          data: { ...data, result_type: data.result_type as ResultType, niche: data.niche || null },
          limits: metricLimits,
        });
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await createClient.mutateAsync({
          data: { ...data, result_type: data.result_type as ResultType, niche: data.niche || null },
          limits: metricLimits,
        });
        toast.success('Cliente adicionado com sucesso!');
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar cliente.');
    }
  };

  const limitLabel = (metric: MetricKey) => {
    const isLowerBetter = METRIC_IS_LOWER_BETTER[metric];
    return isLowerBetter ? 'Máximo (R$)' : 'Mínimo (%)';
  };

  const limitPlaceholder = (metric: MetricKey) => {
    if (metric === 'ctr') return 'ex: 1.5';
    if (metric === 'cpm') return 'ex: 25.00';
    if (metric === 'cpc') return 'ex: 2.00';
    if (metric === 'cpl') return 'ex: 15.00';
    return 'ex: 100.00';
  };

  const limitKey = (metric: MetricKey): keyof LimitInputs =>
    METRIC_IS_LOWER_BETTER[metric] ? `${metric}_max` as keyof LimitInputs : `${metric}_min` as keyof LimitInputs;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editClient ? 'Editar Cliente' : 'Adicionar Cliente'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente e configure os limites de métricas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome do cliente *</Label>
                <Input id="name" placeholder="João Silva" error={!!errors.name} {...register('name')} />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Empresa *</Label>
                <Input id="company" placeholder="Empresa Ltda." error={!!errors.company} {...register('company')} />
                {errors.company && <p className="text-xs text-red-400">{errors.company.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="niche">Nicho</Label>
                <Input id="niche" placeholder="Ex: E-commerce, Saúde..." {...register('niche')} />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de resultado *</Label>
                <Select
                  onValueChange={(v) => setValue('result_type', v, { shouldValidate: true })}
                  defaultValue={editClient?.result_type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(RESULT_TYPE_LABELS) as [ResultType, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.result_type && <p className="text-xs text-red-400">{errors.result_type.message}</p>}
              </div>
            </div>

            <Separator />

            {/* Meta API credentials */}
            <div>
              <p className="text-sm font-medium text-white mb-3">Conta de Anúncios (Meta)</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ad_account_id">ID da Conta de Anúncios *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 h-9 flex items-center shrink-0">
                      act_
                    </span>
                    <Input
                      id="ad_account_id"
                      placeholder="123456789"
                      error={!!errors.ad_account_id}
                      {...register('ad_account_id')}
                    />
                  </div>
                  {errors.ad_account_id && <p className="text-xs text-red-400">{errors.ad_account_id.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="access_token">Token de Acesso *</Label>
                  <Input
                    id="access_token"
                    type="password"
                    placeholder="EAAxxxx..."
                    error={!!errors.access_token}
                    {...register('access_token')}
                  />
                  {errors.access_token && <p className="text-xs text-red-400">{errors.access_token.message}</p>}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={testing}
                  onClick={handleTest}
                  className="gap-2"
                >
                  {!testing && <TestTube className="h-3.5 w-3.5" />}
                  Testar conexão
                </Button>
                {testResult && (
                  <p className={`text-xs ${testResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testResult.ok ? '✓ Conexão bem-sucedida!' : `✗ ${testResult.error}`}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Metric limits */}
            <div>
              <p className="text-sm font-medium text-white mb-1">Limites de Métricas</p>
              <p className="text-xs text-gray-500 mb-3">
                Defina os limites aceitáveis para receber alertas visuais no dashboard.
              </p>
              <div className="space-y-2.5">
                {METRICS.map((metric) => (
                  <div key={metric} className="flex items-center gap-3">
                    <div className="w-36 shrink-0">
                      <span className="text-xs font-medium text-gray-400">{METRIC_LABELS[metric]}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-gray-600">{limitLabel(metric)}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={limitPlaceholder(metric)}
                        value={limits[limitKey(metric)]}
                        onChange={(e) => setLimits((prev) => ({ ...prev, [limitKey(metric)]: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="w-5 flex-shrink-0">
                      {limits[limitKey(metric)] && (
                        <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editClient ? 'Salvar alterações' : 'Adicionar cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
