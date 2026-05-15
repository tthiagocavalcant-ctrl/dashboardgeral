import { useQuery } from '@tanstack/react-query';
import { fetchClientCampaignMetrics } from '@/lib/metaApi';
import type { Client, DateRange } from '@/types';
import { getDateRange } from '@/lib/utils';

export function useCampaigns(client: Client | undefined, dateRange: DateRange) {
  const { since, until } = getDateRange(dateRange.preset, dateRange.since, dateRange.until);

  return useQuery({
    queryKey: ['campaigns', client?.id, since, until],
    queryFn: () =>
      fetchClientCampaignMetrics(
        client!.ad_account_id,
        client!.access_token,
        client!.result_type,
        since,
        until,
      ),
    enabled: !!client,
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: 1,
  });
}
