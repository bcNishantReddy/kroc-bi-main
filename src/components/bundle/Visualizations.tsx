
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactECharts from 'echarts-for-react';
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
  const [groupBy, setGroupBy] = useState<string>("none");
  const [echartsOption, setEchartsOption] = useState<any>({});

  const columnNames = Object.keys(bundle.raw_data[0] || {});

  const downloadChart = () => {
    const echartsInstance = echartsRef.current?.getEchartsInstance();
    if (echartsInstance) {
      const base64 = echartsInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });
      const link = document.createElement('a');
      link.download = `${bundle.name}-chart.png`;
      link.href = base64;
      link.click();
    }
  };

  const echartsRef = React.useRef<ReactECharts>(null);

  useEffect(() => {
    if (!xAxis || !yAxis || !bundle.raw_data.length) return;

    try {
      let series: any[] = [];
      let xAxisData: any[] = [];
      let options: any = {
        title: {
          text: `${yAxis} vs ${xAxis}`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          name: xAxis,
          nameLocation: 'middle',
          nameGap: 30,
          data: []
        },
        yAxis: {
          type: 'value',
          name: yAxis,
          nameLocation: 'middle',
          nameGap: 50
        },
        toolbox: {
          feature: {
            saveAsImage: { title: 'Save' }
          }
        }
      };

      if (groupBy && groupBy !== 'none') {
        // Handle grouped data
        const groups = [...new Set(bundle.raw_data.map(item => item[groupBy]))];
        groups.forEach((group) => {
          const groupData = bundle.raw_data.filter(item => item[groupBy] === group);
          const seriesData = groupData.map(item => ({
            value: item[yAxis],
            name: item[xAxis]
          }));

          series.push({
            name: `${group}`,
            type: chartType === 'scatter' ? 'scatter' : chartType,
            data: seriesData,
            smooth: chartType === 'line',
          });
        });

        xAxisData = [...new Set(bundle.raw_data.map(item => item[xAxis]))];
      } else {
        // Handle ungrouped data
        const seriesData = bundle.raw_data.map(item => ({
          value: item[yAxis],
          name: item[xAxis]
        }));

        series.push({
          name: yAxis,
          type: chartType === 'scatter' ? 'scatter' : chartType,
          data: seriesData,
          smooth: chartType === 'line',
        });

        xAxisData = bundle.raw_data.map(item => item[xAxis]);
      }

      // Update options based on chart type
      if (chartType === 'pie') {
        options = {
          ...options,
          series: [{
            type: 'pie',
            radius: '50%',
            data: series[0].data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        };
      } else if (chartType === 'histogram') {
        // Convert to histogram data
        const values = bundle.raw_data.map(item => item[yAxis]);
        const bins = 20;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binSize = (max - min) / bins;
        const histogramData = new Array(bins).fill(0);
        
        values.forEach(value => {
          const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
          histogramData[binIndex]++;
        });

        options = {
          ...options,
          xAxis: {
            type: 'category',
            data: histogramData.map((_, i) => `${(min + i * binSize).toFixed(2)}-${(min + (i + 1) * binSize).toFixed(2)}`)
          },
          series: [{
            type: 'bar',
            data: histogramData
          }]
        };
      } else {
        options = {
          ...options,
          xAxis: {
            ...options.xAxis,
            data: xAxisData
          },
          series: series
        };
      }

      // Add legend if grouped
      if (groupBy && groupBy !== 'none') {
        options.legend = {
          type: 'scroll',
          orient: 'horizontal',
          bottom: 0
        };
      }

      setEchartsOption(options);
    } catch (error) {
      console.error('Error updating chart:', error);
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
              <ReactECharts
                ref={echartsRef}
                option={echartsOption}
                style={{ height: '100%', width: '100%' }}
                theme="light"
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

