
import React from 'react';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface ChartOptions {
  title: string;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
  showGrid: boolean;
  colors: string[];
  xAxisLabel: string;
  yAxisLabel: string;
}

interface ChartAdvancedOptionsProps {
  options: ChartOptions;
  onOptionsChange: (options: ChartOptions) => void;
}

const ChartAdvancedOptions = ({ options, onOptionsChange }: ChartAdvancedOptionsProps) => {
  const handleOptionChange = (key: keyof ChartOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Advanced Options
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chart Options</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Chart Title</Label>
            <Input
              id="title"
              value={options.title}
              onChange={(e) => handleOptionChange('title', e.target.value)}
              placeholder="Enter chart title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="xAxisLabel">X-Axis Label</Label>
            <Input
              id="xAxisLabel"
              value={options.xAxisLabel}
              onChange={(e) => handleOptionChange('xAxisLabel', e.target.value)}
              placeholder="Enter X-axis label"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yAxisLabel">Y-Axis Label</Label>
            <Input
              id="yAxisLabel"
              value={options.yAxisLabel}
              onChange={(e) => handleOptionChange('yAxisLabel', e.target.value)}
              placeholder="Enter Y-axis label"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legendPosition">Legend Position</Label>
            <Select 
              value={options.legendPosition} 
              onValueChange={(value: 'top' | 'bottom' | 'left' | 'right') => handleOptionChange('legendPosition', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select legend position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showGrid">Show Grid</Label>
            <Switch
              id="showGrid"
              checked={options.showGrid}
              onCheckedChange={(checked) => handleOptionChange('showGrid', checked)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChartAdvancedOptions;
