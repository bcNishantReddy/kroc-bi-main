
export type Bundle = {
  id: string;
  name: string;
  raw_data: any[];
  columns_info: Record<string, any>;
  summary_stats: Record<string, any>;
};

export type ChartType = "line" | "bar" | "scatter" | "pie" | "box" | "histogram";

