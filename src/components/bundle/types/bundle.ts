
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
  data_quality_stats?: {
    missing_values: Record<string, number>;
    duplicates: number;
    outliers: Record<string, number>;
  };
  descriptive_stats?: {
    [column: string]: {
      mean?: number;
      median?: number;
      mode?: number;
      std?: number;
      min?: number;
      max?: number;
      quartiles?: number[];
    };
  };
  distribution_analysis?: {
    [column: string]: {
      distribution_type: string;
      skewness: number;
      kurtosis: number;
      histogram_data: [number, number][];
    };
  };
  feature_insights?: {
    importance: Record<string, number>;
    correlations: Record<string, Record<string, number>>;
  };
  time_series_insights?: {
    seasonality?: {
      seasonal_periods: number[];
      seasonal_strength: number;
    };
    trend?: {
      direction: 'increasing' | 'decreasing' | 'stable';
      strength: number;
    };
    stationarity?: {
      is_stationary: boolean;
      p_value: number;
    };
  };
  privacy_compliance?: {
    pii_detected: boolean;
    pii_columns?: string[];
    encryption_status: 'none' | 'partial' | 'full';
    data_retention_policy?: string;
    compliance_score?: number;
    gdpr_status?: {
      compliant: boolean;
      issues: string[];
    };
  };
  integration_config?: {
    export_formats: string[];
    api_enabled: boolean;
    scheduled_updates?: {
      frequency: string;
      last_update: string;
      next_update: string;
    };
    connected_services?: string[];
  };
};

export type ChartType = "line" | "bar" | "scatter" | "pie" | "box" | "histogram";
