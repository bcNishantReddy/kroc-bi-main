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

// Type guard for data quality stats
function isDataQualityStats(obj: any): obj is { 
  missing_values: Record<string, number>; 
  duplicates: number; 
  outliers: Record<string, number>; 
} {
  return (
    obj &&
    typeof obj === 'object' &&
    'missing_values' in obj &&
    'duplicates' in obj &&
    'outliers' in obj &&
    typeof obj.duplicates === 'number'
  );
}

// Type guard for descriptive stats
function isDescriptiveStats(obj: any): obj is Record<string, {
  mean?: number;
  median?: number;
  mode?: number;
  std?: number;
  min?: number;
  max?: number;
  quartiles?: number[];
}> {
  return obj && typeof obj === 'object';
}

// Type guard for distribution analysis
function isDistributionAnalysis(obj: any): obj is Record<string, {
  distribution_type: string;
  skewness: number;
  kurtosis: number;
  histogram_data: [number, number][];
}> {
  return obj && typeof obj === 'object';
}

// Type guard for privacy compliance
function isPrivacyCompliance(obj: any): obj is {
  pii_detected: boolean;
  pii_columns?: string[];
  encryption_status: 'none' | 'partial' | 'full';
  data_retention_policy?: string;
  compliance_score?: number;
  gdpr_status?: {
    compliant: boolean;
    issues: string[];
  };
} {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.pii_detected === 'boolean' &&
    ['none', 'partial', 'full'].includes(obj.encryption_status)
  );
}

// Type guard for integration config
function isIntegrationConfig(obj: any): obj is {
  export_formats: string[];
  api_enabled: boolean;
  scheduled_updates?: {
    frequency: string;
    last_update: string;
    next_update: string;
  };
  connected_services?: string[];
} {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.export_formats) &&
    typeof obj.api_enabled === 'boolean'
  );
}

// Convert raw data from Supabase to Bundle type
export function convertToBundle(data: any): Bundle {
  return {
    id: data.id,
    name: data.name,
    raw_data: Array.isArray(data.raw_data) ? data.raw_data : [],
    columns_info: data.columns_info || {},
    summary_stats: data.summary_stats || {},
    data_source: data.data_source,
    file_format: data.file_format,
    file_size: data.file_size,
    last_updated_at: data.last_updated_at,
    target_variable: data.target_variable,
    data_quality_stats: isDataQualityStats(data.data_quality_stats) 
      ? data.data_quality_stats 
      : { missing_values: {}, duplicates: 0, outliers: {} },
    descriptive_stats: isDescriptiveStats(data.descriptive_stats) 
      ? data.descriptive_stats 
      : {},
    distribution_analysis: isDistributionAnalysis(data.distribution_analysis) 
      ? data.distribution_analysis 
      : {},
    feature_insights: data.feature_insights || { importance: {}, correlations: {} },
    time_series_insights: data.time_series_insights || {},
    privacy_compliance: isPrivacyCompliance(data.privacy_compliance) 
      ? data.privacy_compliance 
      : {
          pii_detected: false,
          encryption_status: 'none',
        },
    integration_config: isIntegrationConfig(data.integration_config) 
      ? data.integration_config 
      : {
          export_formats: [],
          api_enabled: false,
        }
  };
}
