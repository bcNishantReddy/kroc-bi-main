
import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactECharts from 'echarts-for-react';
import { Download, Settings2 } from "lucide-react";
import { Bundle, ChartType } from "./types/bundle";
import { useChartConfig } from "./hooks/useChartConfig";
import ChartControls from "./components/ChartControls";

const Visualizations = ({ bundle }: { bundle: Bundle }) => {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [xAxis, setXAxis] = useState<string>("");
  const [yAxis, setYAxis] = useState<string>("");
  const [groupBy, setGroupBy] = useState<string>("none");
  const echartsRef = useRef<ReactECharts>(null);

  const { echartsOption } = useChartConfig(bundle, chartType, xAxis, yAxis, groupBy);
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

  return (
    <div className="h-full p-4">
      <Card className="p-6 h-full">
        <div className="flex flex-col h-full">
          <ChartControls
            chartType={chartType}
            setChartType={setChartType}
            xAxis={xAxis}
            setXAxis={setXAxis}
            yAxis={yAxis}
            setYAxis={setYAxis}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            columnNames={columnNames}
          />

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

