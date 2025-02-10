
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

type Bundle = {
  id: string;
  name: string;
  raw_data: any[];
  columns_info: Record<string, any>;
  summary_stats: Record<string, any>;
};

type ChartType = "line" | "bar";

const Visualizations = ({ bundle }: { bundle: Bundle }) => {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [xAxis, setXAxis] = useState<string>("");
  const [yAxis, setYAxis] = useState<string>("");

  const columnNames = Object.keys(bundle.raw_data[0] || {});

  const downloadChart = () => {
    // Implementation for chart download
    console.log("Download chart functionality to be implemented");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Chart Type</label>
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">X Axis</label>
            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger>
                <SelectValue placeholder="Select X axis" />
              </SelectTrigger>
              <SelectContent>
                {columnNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Y Axis</label>
            <Select value={yAxis} onValueChange={setYAxis}>
              <SelectTrigger>
                <SelectValue placeholder="Select Y axis" />
              </SelectTrigger>
              <SelectContent>
                {columnNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button onClick={downloadChart} className="w-full">
              Download Chart
            </Button>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {xAxis && yAxis && (
            <ChartContainer>
              {chartType === "line" ? (
                <Line
                  data={bundle.raw_data}
                  dataKey={yAxis}
                  stroke="#8884d8"
                  name={yAxis}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxis} />
                  <YAxis />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                </Line>
              ) : (
                <Bar
                  data={bundle.raw_data}
                  dataKey={yAxis}
                  fill="#8884d8"
                  name={yAxis}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxis} />
                  <YAxis />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                </Bar>
              )}
            </ChartContainer>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Visualizations;
