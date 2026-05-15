export type ResultType =
  | 'lead'
  | 'message'
  | 'link_click'
  | 'engagement'
  | 'profile_visit'
  | 'app_install'
  | 'video_view'
  | 'purchase'
  | 'custom';

export const RESULT_TYPE_LABELS: Record<ResultType, string> = {
  lead: 'Lead',
  message: 'Mensagem Iniciada',
  link_click: 'Clique no Link',
  engagement: 'Engajamento',
  profile_visit: 'Visita ao Perfil',
  app_install: 'Instalação de App',
  video_view: 'Visualização de Vídeo',
  purchase: 'Compra',
  custom: 'Personalizado',
};

// Meta API action_type values mapped to our ResultType
export const RESULT_TYPE_TO_META_ACTION: Record<ResultType, string> = {
  lead: 'lead',
  message: 'onsite_conversion.messaging_conversation_started_7d',
  link_click: 'link_click',
  engagement: 'post_engagement',
  profile_visit: 'omni_view_content',
  app_install: 'mobile_app_install',
  video_view: 'video_view',
  purchase: 'purchase',
  custom: 'offsite_conversion',
};

export type MetricKey = 'cpl' | 'ctr' | 'cpc' | 'cpm' | 'spend';

export const METRIC_LABELS: Record<MetricKey, string> = {
  cpl: 'Custo por Resultado',
  ctr: 'CTR',
  cpc: 'CPC',
  cpm: 'CPM',
  spend: 'Gasto Diário Máx.',
};

export const METRIC_IS_LOWER_BETTER: Record<MetricKey, boolean> = {
  cpl: true,
  ctr: false,  // higher CTR = better
  cpc: true,
  cpm: true,
  spend: true,
};

export interface MetricLimit {
  id?: string;
  client_id?: string;
  metric: MetricKey;
  max_value?: number | null;
  min_value?: number | null;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  niche: string | null;
  result_type: ResultType;
  ad_account_id: string;
  access_token: string;
  created_at: string;
  updated_at: string;
  metric_limits?: MetricLimit[];
}

export type DatePreset = 'today' | 'last_7d' | 'last_14d' | 'last_30d' | 'custom';

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Hoje',
  last_7d: '7 dias',
  last_14d: '14 dias',
  last_30d: '30 dias',
  custom: 'Personalizado',
};

export interface DateRange {
  preset: DatePreset;
  since?: string;
  until?: string;
}

// Meta API response types
export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
}

export interface MetaInsightAction {
  action_type: string;
  value: string;
}

export interface MetaInsights {
  impressions: string;
  clicks: string;
  spend: string;
  ctr: string;
  cpc: string;
  cpm: string;
  actions?: MetaInsightAction[];
  cost_per_action_type?: MetaInsightAction[];
  date_start: string;
  date_stop: string;
}

export interface CampaignMetrics {
  campaign_id: string;
  campaign_name: string;
  status: string;
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  results: number;
  cost_per_result: number;
}

export type AlertStatus = 'ok' | 'warning' | 'alert' | 'no-limit';
