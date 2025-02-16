import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactECharts from 'echarts-for-react';
import { Download } from "lucide-react";
import { Bundle, ChartType } from "./types/bundle";
import { useChartConfig } from "./hooks/useChartConfig";
import ChartControls from "./components/ChartControls";
import ChartAdvancedOptions, { ChartOptions } from "./components/ChartAdvancedOptions";
const Visualizations = ({
  bundle
}: {
  bundle: Bundle;
}) => {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [xAxis, setXAxis] = useState<string>("");
  const [yAxis, setYAxis] = useState<string>("");
  const [groupBy, setGroupBy] = useState<string>("none");
  const [chartOptions, setChartOptions] = useState<ChartOptions>({
    title: "",
    legendPosition: "bottom",
    showGrid: true,
    colors: ['#9b87f5', '#0EA5E9', '#F97316', '#D946EF', '#8B5CF6'],
    xAxisLabel: "",
    yAxisLabel: ""
  });
  const echartsRef = useRef<ReactECharts>(null);
  const {
    echartsOption
  } = useChartConfig(bundle, chartType, xAxis, yAxis, groupBy, chartOptions);
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
  return <div className="h-full w-full p-4 px-0 py-0">
      <Card className="p-6 h-full py-[20px] mx-[102px] px-0">
        <div className="flex flex-col h-full">
          <ChartControls chartType={chartType} setChartType={setChartType} xAxis={xAxis} setXAxis={setXAxis} yAxis={yAxis} setYAxis={setYAxis} groupBy={groupBy} setGroupBy={setGroupBy} columnNames={Object.keys(bundle.raw_data[0] || {})} />

          <div className="flex flex-wrap justify-end gap-2 mb-4">
            <Button variant="outline" onClick={downloadChart} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <ChartAdvancedOptions options={chartOptions} onOptionsChange={setChartOptions} />
          </div>

          <div className="flex-1 min-h-[400px] w-full mx-0 px-[240px] py-[77px] my-[17px]">
            {xAxis && yAxis ? <ReactECharts ref={echartsRef} option={echartsOption} style={{
            height: '100%',
            width: '100%',
            minHeight: '400px'
          }} theme="light" opts={{
            renderer: 'canvas'
          }} /> : <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select axes to display the chart</p>
              </div>}
          </div>
        </div>
      </Card>
    </div>;
};
export default Visualizations;