
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Bundle = {
  id: string;
  name: string;
  raw_data: any[];
  columns_info: Record<string, any>;
  summary_stats: Record<string, any>;
};

const AIDataInsights = ({ bundle }: { bundle: Bundle }) => {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateInsights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: {
          data: bundle.raw_data.slice(0, 100),
          columns: Object.keys(bundle.raw_data[0] || {}),
        },
      });

      if (error) throw error;
      
      setInsights(data.insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate insights. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, [bundle.id]);

  return (
    <Card className="p-6 h-full">
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-4">AI Data Insights</h2>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="absolute inset-0 h-12 w-12 border-4 border-primary/20 rounded-full"></div>
              </div>
              <p className="text-muted-foreground animate-pulse">Analyzing your data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            <div className="prose max-w-none">
              {insights ? (
                <div dangerouslySetInnerHTML={{ __html: insights }} />
              ) : (
                <p>No insights generated yet.</p>
              )}
            </div>
            <Button 
              onClick={generateInsights}
              className="mt-4"
              disabled={loading}
            >
              Regenerate Insights
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIDataInsights;
