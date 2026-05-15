import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Client, MetricLimit, ResultType } from '@/types';

type ClientInsert = {
  name: string;
  company: string;
  niche: string | null;
  result_type: ResultType;
  ad_account_id: string;
  access_token: string;
};

async function fetchClients(): Promise<Client[]> {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const { data: limits } = await supabase
    .from('metric_limits')
    .select('*');

  return (clients ?? []).map((c) => ({
    ...c,
    result_type: c.result_type as ResultType,
    metric_limits: (limits ?? []).filter((l) => l.client_id === c.id) as MetricLimit[],
  }));
}

async function fetchClient(id: string): Promise<Client> {
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  const { data: limits } = await supabase
    .from('metric_limits')
    .select('*')
    .eq('client_id', id);

  return {
    ...client,
    result_type: client.result_type as ResultType,
    metric_limits: (limits ?? []) as MetricLimit[],
  };
}

async function createClient(
  data: ClientInsert,
  limits: Omit<MetricLimit, 'id' | 'client_id'>[],
): Promise<Client> {
  const { data: client, error } = await supabase
    .from('clients')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (limits.length > 0) {
    const limitRows = limits
      .filter((l) => l.max_value != null || l.min_value != null)
      .map((l) => ({ ...l, client_id: client.id }));

    if (limitRows.length > 0) {
      await supabase.from('metric_limits').insert(limitRows);
    }
  }

  return { ...client, result_type: client.result_type as ResultType, metric_limits: [] };
}

async function updateClient(
  id: string,
  data: Partial<ClientInsert>,
  limits: Omit<MetricLimit, 'id' | 'client_id'>[],
): Promise<Client> {
  const { data: client, error } = await supabase
    .from('clients')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Replace limits: delete old, insert new
  await supabase.from('metric_limits').delete().eq('client_id', id);

  if (limits.length > 0) {
    const limitRows = limits
      .filter((l) => l.max_value != null || l.min_value != null)
      .map((l) => ({ ...l, client_id: id }));

    if (limitRows.length > 0) {
      await supabase.from('metric_limits').insert(limitRows);
    }
  }

  return { ...client, result_type: client.result_type as ResultType, metric_limits: [] };
}

async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function useClients() {
  return useQuery({ queryKey: ['clients'], queryFn: fetchClients });
}

export function useClient(id: string) {
  return useQuery({ queryKey: ['clients', id], queryFn: () => fetchClient(id), enabled: !!id });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, limits }: { data: ClientInsert; limits: Omit<MetricLimit, 'id' | 'client_id'>[] }) =>
      createClient(data, limits),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      limits,
    }: {
      id: string;
      data: Partial<ClientInsert>;
      limits: Omit<MetricLimit, 'id' | 'client_id'>[];
    }) => updateClient(id, data, limits),
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      qc.invalidateQueries({ queryKey: ['clients', vars.id] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}
