import type {
  MetaCampaign,
  MetaInsights,
  MetaInsightAction,
  CampaignMetrics,
  ResultType,
} from '@/types';
import { RESULT_TYPE_TO_META_ACTION } from '@/types';

const META_API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface MetaApiError {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

async function fetchMeta<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = (await res.json()) as T | MetaApiError;

  if (!res.ok || 'error' in (data as object)) {
    const err = data as MetaApiError;
    throw new Error(err.error?.message ?? 'Erro ao consultar a API da Meta');
  }

  return data as T;
}

export async function fetchActiveCampaigns(
  adAccountId: string,
  accessToken: string,
): Promise<MetaCampaign[]> {
  const params = new URLSearchParams({
    fields: 'id,name,status,objective',
    filtering: JSON.stringify([
      { field: 'effective_status', operator: 'IN', value: ['ACTIVE'] },
    ]),
    limit: '100',
    access_token: accessToken,
  });

  const url = `${BASE_URL}/act_${adAccountId}/campaigns?${params}`;

  const data = await fetchMeta<{ data: MetaCampaign[] }>(url);
  return data.data ?? [];
}

export async function fetchCampaignInsights(
  campaignId: string,
  accessToken: string,
  since: string,
  until: string,
): Promise<MetaInsights | null> {
  const params = new URLSearchParams({
    fields:
      'impressions,clicks,spend,ctr,cpc,cpm,actions,cost_per_action_type',
    time_range: JSON.stringify({ since, until }),
    access_token: accessToken,
  });

  const url = `${BASE_URL}/${campaignId}/insights?${params}`;

  const data = await fetchMeta<{ data: MetaInsights[] }>(url);
  return data.data?.[0] ?? null;
}

function getActionValue(
  actions: MetaInsightAction[] | undefined,
  actionType: string,
): number {
  if (!actions) return 0;
  const action = actions.find((a) => a.action_type === actionType);
  return action ? parseFloat(action.value) : 0;
}

export async function fetchClientCampaignMetrics(
  adAccountId: string,
  accessToken: string,
  resultType: ResultType,
  since: string,
  until: string,
): Promise<CampaignMetrics[]> {
  const campaigns = await fetchActiveCampaigns(adAccountId, accessToken);

  const metaActionType = RESULT_TYPE_TO_META_ACTION[resultType];

  const metricsPromises = campaigns.map(async (campaign) => {
    try {
      const insights = await fetchCampaignInsights(
        campaign.id,
        accessToken,
        since,
        until,
      );

      if (!insights) {
        return {
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          spend: 0,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          results: 0,
          cost_per_result: 0,
        };
      }

      const results = getActionValue(insights.actions, metaActionType);
      const costPerResult = results > 0
        ? parseFloat(insights.spend) / results
        : getActionValue(insights.cost_per_action_type, metaActionType);

      return {
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        spend: parseFloat(insights.spend) || 0,
        impressions: parseInt(insights.impressions) || 0,
        clicks: parseInt(insights.clicks) || 0,
        ctr: parseFloat(insights.ctr) || 0,
        cpc: parseFloat(insights.cpc) || 0,
        cpm: parseFloat(insights.cpm) || 0,
        results,
        cost_per_result: costPerResult,
      };
    } catch {
      return {
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        spend: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        results: 0,
        cost_per_result: 0,
      };
    }
  });

  return Promise.all(metricsPromises);
}

export async function testMetaConnection(
  adAccountId: string,
  accessToken: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const params = new URLSearchParams({
      fields: 'id,name',
      access_token: accessToken,
    });
    const url = `${BASE_URL}/act_${adAccountId}?${params}`;
    await fetchMeta(url);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erro desconhecido' };
  }
}
