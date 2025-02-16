import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartType } from '../types/bundle';
interface ChartControlsProps {
  chartType: ChartType;
  setChartType: (value: ChartType) => void;
  xAxis: string;
  setXAxis: (value: string) => void;
  yAxis: string;
  setYAxis: (value: string) => void;
  groupBy: string;
  setGroupBy: (value: string) => void;
  columnNames: string[];
}
const ChartControls = ({
  chartType,
  setChartType,
  xAxis,
  setXAxis,
  yAxis,
  setYAxis,
  groupBy,
  setGroupBy,
  columnNames
}: ChartControlsProps) => {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mx-[67px]">
      <div>
        <label className="block text-sm font-medium mb-2">Chart Type</label>
        <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="scatter">Scatter Plot</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="histogram">Histogram</SelectItem>
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
            {columnNames.map(name => <SelectItem key={name} value={name}>
                {name}
              </SelectItem>)}
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
            {columnNames.map(name => <SelectItem key={name} value={name}>
                {name}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Group By (Optional)</label>
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger>
            <SelectValue placeholder="Select grouping" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {columnNames.map(name => <SelectItem key={name} value={name}>
                {name}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>;
};
export default ChartControls;