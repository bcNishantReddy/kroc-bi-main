
import { useEffect, useState } from 'react';
import { Bundle, ChartType } from '../types/bundle';
import { ChartOptions } from '../components/ChartAdvancedOptions';

export const useChartConfig = (
  bundle: Bundle,
  chartType: ChartType,
  xAxis: string,
  yAxis: string,
  groupBy: string,
  chartOptions: ChartOptions
) => {
  const [echartsOption, setEchartsOption] = useState<any>({});

  useEffect(() => {
    if (!xAxis || !yAxis || !bundle.raw_data.length) return;

    try {
      let series: any[] = [];
      let xAxisData: any[] = [];
      let options: any = {
        title: {
          text: chartOptions.title || `${yAxis} vs ${xAxis}`,
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
          containLabel: true,
          show: chartOptions.showGrid
        },
        xAxis: {
          type: 'category',
          name: chartOptions.xAxisLabel || xAxis,
          nameLocation: 'middle',
          nameGap: 30,
          data: []
        },
        yAxis: {
          type: 'value',
          name: chartOptions.yAxisLabel || yAxis,
          nameLocation: 'middle',
          nameGap: 50
        },
        toolbox: {
          feature: {
            saveAsImage: { title: 'Save' }
          }
        },
        color: chartOptions.colors
      };

      if (groupBy && groupBy !== 'none') {
        const groups = [...new Set(bundle.raw_data.map(item => item[groupBy]))];
        groups.forEach((group, index) => {
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

      if (groupBy && groupBy !== 'none') {
        options.legend = {
          type: 'scroll',
          orient: chartOptions.legendPosition === 'left' || chartOptions.legendPosition === 'right' ? 'vertical' : 'horizontal',
          [chartOptions.legendPosition]: 0
        };
      }

      setEchartsOption(options);
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }, [xAxis, yAxis, groupBy, chartType, bundle.raw_data, chartOptions]);

  return { echartsOption };
};
