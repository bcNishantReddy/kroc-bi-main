
export type Bundle = {
  id: string;
  name: string;
  raw_data: any[];
  columns_info: Record<string, any>;
  summary_stats: Record<string, any>;
  data_source?: string;
  file_format?: string;
  file_size?: number;
  last_updated_at?: string;
  target_variable?: string;
  data_quality_stats?: Record<string, any>;
  descriptive_stats?: Record<string, any>;
  distribution_analysis?: Record<string, any>;
  feature_insights?: Record<string, any>;
  time_series_insights?: Record<string, any>;
  relationship_metrics?: Record<string, any>;
  privacy_compliance?: Record<string, any>;
  integration_config?: Record<string, any>;
};

export type ChartType = "line" | "bar" | "scatter" | "pie" | "box" | "histogram";
