
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Plot from 'react-plotly.js';
import { Download, Settings2 } from "lucide-react";

type Bundle = {
  id: string;
  name: string;
  raw_data: any[];
  columns_info: Record<string, any>;
  summary_stats: Record<string, any>;
};

type ChartType = "line" | "bar" | "scatter" | "pie" | "box" | "histogram";

const Visualizations = ({ bundle }: { bundle: Bundle }) => {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [xAxis, setXAxis] = useState<string>("");
  const [yAxis, setYAxis] = useState<string>("");
  const [groupBy, setGroupBy] = useState<string>("");
  const [plotData, setPlotData] = useState<any[]>([]);
  const [layout, setLayout] = useState<any>({});

  const columnNames = Object.keys(bundle.raw_data[0] || {});

  // Define the plot configuration
  const plotConfig = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
  };

  const downloadChart = () => {
    const plotElement = document.querySelector('.js-plotly-plot');
    if (plotElement) {
      // @ts-ignore - Plotly types are not complete
      Plotly.downloadImage(plotElement, {
        format: 'png',
        height: 800,
        width: 1200,
        filename: `${bundle.name}-chart`,
      });
    }
  };

  useEffect(() => {
    if (!xAxis || !yAxis || !bundle.raw_data.length) return;

    try {
      let newPlotData: any = {
        x: bundle.raw_data.map(item => item[xAxis]),
        y: bundle.raw_data.map(item => item[yAxis]),
        type: chartType,
        mode: chartType === 'scatter' ? 'markers' : undefined,
        marker: { color: '#8884d8' },
        name: yAxis,
      };

      if (groupBy) {
        const groups = [...new Set(bundle.raw_data.map(item => item[groupBy]))];
        newPlotData = groups.map(group => ({
          ...newPlotData,
          x: bundle.raw_data.filter(item => item[groupBy] === group).map(item => item[xAxis]),
          y: bundle.raw_data.filter(item => item[groupBy] === group).map(item => item[yAxis]),
          name: `${group}`,
        }));
      }

      setPlotData(Array.isArray(newPlotData) ? newPlotData : [newPlotData]);

      setLayout({
        autosize: true,
        title: `${yAxis} vs ${xAxis}`,
        xaxis: { title: xAxis },
        yaxis: { title: yAxis },
        hovermode: 'closest',
        margin: { l: 50, r: 50, b: 50, t: 50 },
      });
    } catch (error) {
      console.error('Error updating plot:', error);
    }
  }, [xAxis, yAxis, groupBy, chartType, bundle.raw_data]);

  return (
    <div className="h-full p-4">
      <Card className="p-6 h-full">
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  <SelectItem value="box">Box Plot</SelectItem>
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
            
            <div>
              <label className="block text-sm font-medium mb-2">Group By (Optional)</label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grouping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {columnNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mb-4">
            <Button 
              variant="outline" 
              onClick={downloadChart}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4" />
              Advanced Options
            </Button>
          </div>

          <div className="flex-1 min-h-[400px]">
            {xAxis && yAxis ? (
              <Plot
                data={plotData}
                layout={{...layout, height: '100%', width: '100%'}}
                config={plotConfig}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select axes to display the chart</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Visualizations;

