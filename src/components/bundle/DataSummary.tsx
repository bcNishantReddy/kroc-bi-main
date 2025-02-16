
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { FileText, Database, BarChart2, Clock, Shield, Link } from "lucide-react";
import { format } from "date-fns";
import type { Bundle } from "./types/bundle";

const DataSummary = ({ bundle }: { bundle: Bundle }) => {
  const columnNames = Object.keys(bundle.raw_data[0] || {});
  const rowCount = bundle.raw_data.length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-6 p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="schema" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden md:inline">Schema</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden md:inline">Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden md:inline">Time Series</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span className="hidden md:inline">Integrations</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Dataset Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium text-muted-foreground">Data Source</h3>
                    <p className="text-foreground">{bundle.data_source || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">File Format</h3>
                    <p className="text-foreground">{bundle.file_format || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">File Size</h3>
                    <p className="text-foreground">{formatFileSize(bundle.file_size)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Last Updated</h3>
                    <p className="text-foreground">{formatDate(bundle.last_updated_at)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Number of Rows</h3>
                    <p className="text-foreground">{rowCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Number of Columns</h3>
                    <p className="text-foreground">{columnNames.length.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="schema" className="space-y-4 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Column Information</h2>
              <div className="grid gap-4">
                {columnNames.map((columnName) => (
                  <div key={columnName} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-medium">{columnName}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                      <p className="text-sm text-muted-foreground">
                        Type: {typeof bundle.raw_data[0][columnName]}
                      </p>
                      {bundle.columns_info[columnName] && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Unique Values: {bundle.columns_info[columnName].unique_count || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Missing Values: {bundle.columns_info[columnName].missing_count || "N/A"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Statistical Analysis</h2>
              {bundle.descriptive_stats && Object.keys(bundle.descriptive_stats).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(bundle.descriptive_stats).map(([column, stats]) => (
                    <div key={column} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-medium mb-2">{column}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(stats as Record<string, any>).map(([stat, value]) => (
                          <div key={stat}>
                            <p className="text-sm text-muted-foreground capitalize">{stat.replace(/_/g, ' ')}</p>
                            <p className="font-medium">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No statistical analysis available</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="time" className="space-y-4 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Time Series Analysis</h2>
              {bundle.time_series_insights && Object.keys(bundle.time_series_insights).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(bundle.time_series_insights).map(([metric, value]) => (
                    <div key={metric} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-medium capitalize mb-2">{metric.replace(/_/g, ' ')}</h3>
                      <p className="text-muted-foreground">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No time series insights available</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Privacy Compliance</h2>
              {bundle.privacy_compliance && Object.keys(bundle.privacy_compliance).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(bundle.privacy_compliance).map(([check, status]) => (
                    <div key={check} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-medium capitalize mb-2">{check.replace(/_/g, ' ')}</h3>
                      <p className="text-muted-foreground">
                        {typeof status === 'object' ? JSON.stringify(status, null, 2) : status}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No privacy compliance data available</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Integration Settings</h2>
              {bundle.integration_config && Object.keys(bundle.integration_config).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(bundle.integration_config).map(([integration, config]) => (
                    <div key={integration} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-medium capitalize mb-2">{integration.replace(/_/g, ' ')}</h3>
                      <p className="text-muted-foreground">
                        {typeof config === 'object' ? JSON.stringify(config, null, 2) : config}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No integration settings available</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default DataSummary;
